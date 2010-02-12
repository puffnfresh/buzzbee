# -*- coding: utf-8 -*-
from google.appengine.api import images
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

import urllib

import os
import logging

FEED_TEMPLATE = 'http://buzz.googleapis.com/feeds/%s/public/posted'


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
    [(r'/feed/(.+)', FeedHandler),
     (r'/resize/(\d+)/(.+)', ResizeHandler),
     (r'/', IndexHandler),
     (r'/.*', NotFoundHandler)])

def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
