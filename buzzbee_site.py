# -*- coding: utf-8 -*-
from django.utils import simplejson
from google.appengine.api import images
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

import os
import logging
import urllib
from xml.dom import minidom

FEED_TEMPLATE = 'http://buzz.googleapis.com/feeds/%s/public/posted'


class JsonFeedHandler(webapp.RequestHandler):
    def get(self, user):
        # These are simple nodes that don't require any special parsing to get
        # their content.
        self._entry_text_nodes = [
            'title',
            'summary',
            'content',
            'published',
            'updated'
        ]
        self._author_text_nodes = [
            'name',
            'uri'
        ]
        
        user = user.replace('%20', '')
    
        url = FEED_TEMPLATE % user
        result = urlfetch.fetch(url)
        
        dom = minidom.parseString(result.content)
        
        entries = []
        for dom_entry in dom.getElementsByTagName('entry'):
            entries.append(self._parse_entry(dom_entry))
        
        json = simplejson.dumps(entries, indent=4)
        content = json
        
        # If a callback is supplied, use JSONP.
        padding = self.request.get("callback")
        if padding:
            content = padding + '(' + json + ')'
        
        self.response.headers['Content-Type'] = \
            'application/javascript; charset=UTF-8'
        
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.out.write(content)
        
    def _parse_entry(self, dom_entry):
        entry = {}
        for node in dom_entry.childNodes:
            if node.tagName == 'media:content':
                if not entry.has_key('media'):
                    entry['media'] = []
            
                entry['media'].append(self._parse_media(node))
            if node.tagName == 'author':
                entry['author'] = self._parse_author(node)
            if node.tagName == 'link':
                if not entry.has_key('links'):
                    entry['links'] = {}
                    
                rel = node.getAttribute('rel')
                entry['links'][rel] = node.getAttribute('href')
            elif node.tagName == 'thr:total':
                # Rename this node to something more descriptive.
                entry['comments'] = self._get_node_text(node)
            elif node.tagName in self._entry_text_nodes:
                entry[node.tagName] = self._get_node_text(node)
        
        return entry
        
    def _parse_media(self, dom_media):
        media = {
            'url': dom_media.getAttribute('url'),
            'medium': dom_media.getAttribute('medium')
        }
        
        if dom_media.hasAttribute('type'):
            media['type'] = dom_media.getAttribute('type')
            
        for node in dom_media.childNodes:
            if node.tagName == 'media:title':
                media['title'] = self._get_node_text(node)
            elif node.tagName == 'media:player':
                media['player'] = {
                    'url': node.getAttribute('url'),
                    'width': node.getAttribute('width'),
                    'height': node.getAttribute('height')
                }
        
        return media
        
    def _parse_author(self, dom_author):
        author = {}
        for node in dom_author.childNodes:
            if node.tagName in self._author_text_nodes:
                author[node.tagName] = self._get_node_text(node)
                
        return author
        
    def _get_node_text(self, node):
        text = ''
        for child in node.childNodes:
            if child.nodeType == child.TEXT_NODE:
                text += child.data
    
        return text

class FeedHandler(webapp.RequestHandler):
    def get(self, user):
        url = FEED_TEMPLATE % user
        result = urlfetch.fetch(url)
        
        # IE doesn't seem to work with 'application/atom+xml'
        self.response.headers['Content-Type'] = 'text/xml; charset=UTF-8'

        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.out.write(result.content)

# Used for caching resized feed images.
class ResizedImage(db.Model):
    url = db.StringProperty()
    height = db.IntegerProperty()
    data = db.BlobProperty()

class ResizeHandler(webapp.RequestHandler):
    def get(self, h, url):
        h = int(h)

        query = ResizedImage.all()
        query.filter('height', h)
        query.filter('url', url)

        resized_image = query.get()
        if not resized_image:
            resized_image = ResizedImage()

            resized_image.url = url
            resized_image.height = h

            result = urlfetch.fetch(urllib.unquote_plus(url))

            image_data = images.resize(result.content, height=h)
            resized_image.data = db.Blob(image_data)

            resized_image.put()

        self.response.headers['Cache-Control'] = "max-age=604800"
        self.response.headers['Content-Type'] = "image/png"
        self.response.out.write(resized_image.data)

class IndexHandler(webapp.RequestHandler):
    def get(self):
        path = os.path.join('templates', 'index.html')
        content = template.render(path, {})
        self.response.out.write(content)

class NotFoundHandler(webapp.RequestHandler):
    def get(self):
        self.error(404)

        path = os.path.join('templates', 'not_found.html')
        content = template.render(path, {})
        self.response.out.write(content)

application = webapp.WSGIApplication(
    [(r'/jsonfeed/(.+)', JsonFeedHandler),
     (r'/feed/(.+)', FeedHandler),
     (r'/resize/(\d+)/(.+)', ResizeHandler),
     (r'/', IndexHandler),
     (r'/.*', NotFoundHandler)])

def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
