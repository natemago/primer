#!/usr/bin/python3

from fileinput import close
from genericpath import isdir
from http.server import HTTPServer as HTTPServer, \
    SimpleHTTPRequestHandler as SimpleHTTPRequestHandler
from io import BytesIO as BytesIO, StringIO
from urllib import parse
import os.path
import posixpath
import re
import shutil
import socket
import time
import urllib
import uuid
import configparser
from zipfile import ZipFile
import base64



class HTTPException(Exception):
    def __init__(self, message="", code=500, cause=None):
        Exception.__init__(self)
        self.message = message
        self.code = code
        self.__cause__ = cause






class BaseMappedHander:
    def __init__(self, base_path=""):
        self.base_path = base_path
    
    
    def process(self, request, response):
        m = getattr(self, "do_" + request.method.upper())
        if m != None:
            m(request, response)
        else:
            response.send_error(501)
    
    def do_HEAD(self, request, response):
        pass
    def do_OPTIONS(self, request, response):
        pass
    def do_GET(self, request, response):
        pass
    def do_POST(self, request, response):
        pass
    def do_PUT(self, request, response):
        pass
    def do_DELETE(self, request, response):
        pass

class DispatcherHTTPServer(HTTPServer):
    def __init__(self, server_address, RequestHandlerClass, 
                 bind_and_activate=True, handlers=[],
                 srv_path=".",
                 configuration={}):
        HTTPServer.__init__(self, server_address, RequestHandlerClass, bind_and_activate)
        self.handlers = sorted(handlers, key=lambda k: k["weight"])
        self.srv_path = srv_path
        self.initialize_server()
        self.configuration = configuration
    def initialize_server(self):
        pass
    

class HTTPSession:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.attributes = {}
        self.invalid = False
    
    def set(self, name, value):
        self.attributes[name] = value
        
    def rem(self, name):
        val = self.attributes.get(name)
        if val != None:
            del self.attributes[name]

class HTTPRequest:
    def __init__(self):
        self.method = ""
        self.query_string = ""
        self.in_stream = ""
        self.params = {}
        self.files = {}
        self.path = ""
        self.request_url = ""
        self.session = {}
        self.attributes = {}
        self.headers = {}
        self.remote_ip = ""
        self.host = ("",0) # Tupple (name, port)
        self.scheme = "HTTP"
        self.protocol_version = "1.0"
        self.forwarded = False
        
        
    def get_session(self):
        if self.session == None:
            self.session = HTTPSession()
        
    def forward(self, to_path):
        self.forwarded = True
        self.path = to_path



class HTTPResponse:
    def __init__(self):
        self.code = 200
        self.message = ""
        self.error = False
        self.out_stream = BytesIO()
        self.headers = {}
        
    
    def write(self, msg):
        if(isinstance(msg, str)):
            self.out_stream.write(msg.encode())
        else:
            self.out_stream.write(msg)
    
    def send_error(self, code, message=None):
        self.code = code
        self.message = message
    
    def redirect(self, to_url):
        self.code = 301
        self.headers["Location"] = to_url

class DispatcherHTTPHandler(SimpleHTTPRequestHandler):
    def handle_one_request(self):
        """
        Overrides the method in the base HTTP handler
        """
        try:
            self.raw_requestline = self.rfile.readline(65537)
            if len(self.raw_requestline) > 65536:
                self.requestline = ''
                self.request_version = ''
                self.command = ''
                self.send_error(414)
                return
            if not self.raw_requestline:
                self.close_connection = 1
                return
            if not self.parse_request():
                # An error code has been sent, just exit
                return
            self.do_handle_one_request(self.path)
            self.wfile.flush() #actually send the response if not already done.
        except socket.timeout as e:
            #a read or a write timed out.  Discard this connection
            self.log_error("Request timed out: %r", e)
            self.close_connection = 1
            return
    
    def do_handle_one_request(self, path, request=None):
        self.path = path
        self.log_message("PATH: %r (%r)", self.path, self.command)
        for hndDef in self.server.handlers:
            self.log_message("\t Checking [%r]", hndDef["name"])
            #hndDef = self.server.handlers[name]
            pattern = hndDef["pattern"]
            for p in pattern:
                if re.match(p, self.path):
                    self.log_message("\t\t-> match")
                    hnd = hndDef["handler"]
                    if(request == None):
                        request = self.construct_request()
                    response = self.construct_response()
                    hnd.base_path = os.path.abspath(self.server.srv_path) # TODO
                    hnd.process(request, response)
                    self.process_response(request, response)
                    return
                
        self.log_message("Pass to default...")
        self.process_default_request()
        self.log_message("Processing ended.")
    
    def construct_request(self):
        req = HTTPRequest()
        req.path, qm, req.query_string = self.path.partition("?")
        req.headers = self.headers
        req.method = self.command
        req.host = (self.server.server_name, self.server.server_port)
        req.remote_ip, remote_port = self.client_address
        req.scheme, sep, req.protocol_version = self.protocol_version.partition("/")
        req.in_stream = BytesIO()
        
        cl = self.headers.get("Content-Length")
        body = ''
        if(cl is not None):
            cl = int(str(cl))
            self.log_message("test - Content Length: %d"%(cl))
            req.in_stream.write(self.rfile.read(cl))
            print("REQUEST:\n%s"%req.in_stream.getvalue())
            body = req.in_stream.getvalue()
            if (body is not None):
                body = body.decode("utf-8") # FIXME: use the proper encoding here...
            else:
                body = ""
        req.params =  self._parse_request_params(req.method, body, "")
        print(req.params)
        return req
    
    def _parse_request_params(self, method, body, query_string):
        params = {}
        if( method == 'POST' or method == 'GET' ):
            body = urllib.parse.unquote(body)
            body = body[:-1]
            raw_params = urllib.parse.parse_qs(body) or {}
            params = self.__fix_params(raw_params)
            
        
        query_params = urllib.parse.parse_qs(query_string)
        if(query_params == None):
            query_params = {}
        query_params = self.__fix_params(query_params)
        if(params == None):
            params = {}
            
        params.update(query_params)
        return params
    def __fix_params(self, raw_params):
        params = {}
        for  name, value in raw_params.items():
            if (len(value) == 1):
                params[name] = value[0]
            else:
                params[name] = value
        return params
    
    def construct_response(self):
        return HTTPResponse()
    
    def process_response(self, request, response):
        if(request.forwarded):
            request.forwarded = False
            self.do_handle_one_request(request.path, request)
            return
        if(response.error):
            self.send_error(response.code, response.message)
            return
        if(response.code != 200):
            self.send_response(response.code, response.message)
        else:
            self.send_response_only(response.code, response.message)
        sent_headers = False
        for name,value in response.headers.items():
            self.send_header(name, value)
            sent_headers = True
        if(sent_headers):
            self.end_headers()
        
        #shutil.copyfileobj(response.out_stream, self.wfile)
        self.wfile.write(response.out_stream.getvalue())
        
    
    def process_default_request(self):
        mname = 'do_' + self.command
        if not hasattr(self, mname):
            self.send_error(501, "Unsupported method (%r)" % self.command)
            return
        method = getattr(self, mname)
        method()


    
class SimpleHandler (BaseMappedHander):
    
    DIRECTORY_LISTING_DOC_TEMPLATE = """
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>%(path)s</title>
<style type="text/css">
    body{
        font-family: monospace;
        background: #F0F0F0;
        color: gray;
    }
    td,th{
        font-family: monospace;
        text-align: right;
        padding-left: 30px;
        
    }
    
    th{
        color: #0084DB;
    }
    
    .header{
        font-weight: bold;
        font-size: 14px;
        padding: 10px;
    }
    .footer{
        color: gray;
        text-align: right;
        padding: 5px;
    }
    .content{
        border: 1px solid #D9D9D9;
        background: #fff;
        padding: 20px;
        
        
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
        box-shadow: 1px 1px 3px #0084DB;
    }
    
    a.link-dir{
        color: gray;
        font-weight: bold;
    }
    
    a.link-dir:HOVER{
        color: #D6A400;
    }
    
    a.link-file{
        color: gray;
        text-decoration: none;
    }
    
    a.link-file:HOVER{
        color: #D6A400;
    }
    .info-name{
        text-align: left;
    }
    
</style>
</head>
<body>
<div class="header">
    %(path)s (%(dir_path)s)
</div>
<div class="content">
    
    <table>
        <thead>
            <tr>
                <th class="info-name">Name</th>
                <th>Size</th>
                <th>Modified</th>
            </tr>
        </thead>
        <tbody>
            %(_FILES_LISTING_)s
        </tbody>
    </table>
    
</div>
<div class="footer">
srv, version %(server_version)s
</div>
</body>
</html>
"""
    DIRECTORY_ENTRY_TEMPLATE = """
             <tr>
                <td class="info-name"><a href="%(path)s" class="link-dir">%(name)s</a></td>
                <td class="info-size">%(size)s</td>
                <td class="info-modified">%(modified)s</td>
            </tr>"""
    FILE_ENTRY_TEMPLATE = """
             <tr>
                <td class="info-name"><a href="%(path)s" class="link-file">%(name)s</a></td>
                <td class="info-size">%(size)s</td>
                <td class="info-modified">%(modified)s</td>
            </tr>"""
    
    def do_GET(self, request, response):
        try:
            abspath = os.path.abspath(self.base_path + "/" + request.path)
            if(not abspath.startswith(self.base_path)):
                response.send_error(403)
            else:
                if(os.path.exists(abspath)):
                    self.do_process(request, response , abspath)
                else:
                    response.send_error(404)
        except IOError:
            response.send_error(404)
            
        
    def do_process(self, request, response, abspath):
        if isdir(abspath):
            if(not request.path.endswith('/') ):
                response.redirect(request.path + '/')
            else:
                self.process_dir(request, response, abspath)
        else:
            self.process_file(request, response, abspath)
    
    def process_dir(self, request, response, abspath):
        files = os.listdir(abspath)
        listingBuffer = []
        params = {}
        params["name"] = ".."
        params["path"] = request.path + ".."
        params["modified"] = time.ctime(os.path.getmtime(abspath + "/.."))
        params["full_path"] = abspath + "/.."
        params["size"] = "--"
        listingBuffer.append(self._format_dir(params))
        for fn in files:
            try:
                file_path = abspath + "/" + fn
                
                
                params = {}
                params["name"] = fn
                params["path"] = request.path + fn
                params["modified"] = time.ctime(os.path.getmtime(file_path))
                params["full_path"] = file_path
                if (os.path.isdir(file_path)):
                    params["size"] = "--"
                    listingBuffer.append(self._format_dir(params))
                else:
                    fh = open(file_path,"r")
                    params["size"] = os.fstat(fh.fileno())[6]
                    fh.close()
                    listingBuffer.append(self._format_file(params))
                    
            except IOError as e:
                print(e) 
        
        g_params = {}
        g_params["server_version"] = "0.1.0"
        g_params["dir_path"] = abspath
        g_params["path"] = request.path
        g_params["_FILES_LISTING_"] = ''.join(listingBuffer)
        response.headers["Content-Type"] = "text/html";
        response.write(self._format_directory_listing(g_params))
        
    
    def _format_file(self, params):
        #return SimpleHandler.FILE_ENTRY_TEMPLATE % params
        return _DEFAULT_RC_LOADER.get_resource_str("templates/file.html") % params
        
    
    def _format_dir(self, params):
        #return SimpleHandler.DIRECTORY_ENTRY_TEMPLATE % params
        return _DEFAULT_RC_LOADER.get_resource_str("templates/dir.html") % params
    
    def _format_directory_listing(self, params):
        #return SimpleHandler.DIRECTORY_LISTING_DOC_TEMPLATE % params
        return _DEFAULT_RC_LOADER.get_resource_str("templates/main.html") % params
    
    def process_file(self, request, response, abspath):
        response.headers["Content-type"] = self._get_mime_type(request.path)
        try:
            fh = open(abspath, "rb")
            fs = os.fstat(fh.fileno())
            response.headers["Content-Length"] = fs[6]
            response.headers["Last-Modified"] = self._date_time_string(fs.st_mtime)
            
            shutil.copyfileobj(fh, response.out_stream)
            
            fh.close()
        except IOError as ioe:
            print(ioe)
            response.send_error(500, str(ioe))
    
    def _get_mime_type(self, path):
        base, ext = posixpath.splitext(path)
        if ext in SimpleHTTPRequestHandler.extensions_map:
            return SimpleHTTPRequestHandler.extensions_map[ext]
        ext = ext.lower()
        if ext in SimpleHTTPRequestHandler.extensions_map:
            return SimpleHTTPRequestHandler.extensions_map[ext]
        else:
            return SimpleHTTPRequestHandler.extensions_map['']
    
    def _date_time_string(self, timestamp=None):
        """Return the current date and time formatted for a message header."""
        if timestamp is None:
            timestamp = time.time()
        year, month, day, hh, mm, ss, wd, y, z = time.gmtime(timestamp)
        s = "%s, %02d %3s %4d %02d:%02d:%02d GMT" % (
                SimpleHTTPRequestHandler.weekdayname[wd],
                day, SimpleHTTPRequestHandler.monthname[month], year,
                hh, mm, ss)
        return s


_DEFAULT_CONFIG={
    "server":{
        "port": 8000,
        "serve_path": "."
    },
    "handlers":{
        "__default__": {
            "class": "SimpleHandler",
            "pattern":".*",
            "weight": -1
        }
    }
}

def read_config(fileName, defaults):
    config = configparser.ConfigParser()
    config.read(fileName)
    cnf = {}
    sections = config.sections()
    
    for section in sections:
        sec = {}
        cnf[section] = sec
        for name, value in config.items(section):
            cnf[section][name] = value
    
    return cnf
    


class ClassLoader:
    
    def __init__(self, context={}):
        self.context = context
        
    
    def load_class(self, path):
        module, dot, clazz =  path.rpartition('.')
        try:
            mod = __import__(module, context, context, [clazz], -1)
            constr = getattr(mod,clazz)
            return constr
        except Exception as e:
            raise Exception(e, "Cannot load class %s"%path)

    def get_instance(self, class_name, params=None):
        clz = self.load_class(class_name)
        instance = None
        if params == None:
            instance = clz()
        else:
            instance = clz(*params)
        
        return instance



class ZipLoader:
    _ZIP_ARCHIVE_PATTERNS = ['.*\\.zip','.*\\.jar']
    OVERRIDE = 0
    IGNORE = 1
    IMMEDIATE = 2
    LAZY = 4
    def __init__(self, path=[], policy=None, loading=None):
        self.path = path
        self.policy = policy or self.OVERRIDE
        self.loading = loading or self.LAZY
        self.cache = {}
        self.scan()
    
    def scan(self):
        for p  in self.path:
            self._scan(p)
    
    def _scan(self, file_path):
        if(isinstance(file_path, str) and os.path.isdir(file_path)):
            names = os.listdir(file_path)
            for n in names:
                self._scan(file_path + '/' + n)
        elif (isinstance(file_path,BytesIO)):
            self._read_zip_file(file_path)
        else:
            if(self._is_zip_archive(file_path)):
                self._read_zip_file(file_path)
    
    def _read_zip_file(self, zf):
        try:
            zh = ZipFile(zf, "r")
            names = zh.namelist()
            for name in names:
                existing = self.cache.get(name)
                load_now = False
                if existing != None:
                    if self.policy == ZipLoader.OVERRIDE:
                        load_now = True
                else:
                    load_now = True
                
                if(load_now):
                    entry = {}
                    entry["name"] = name
                    entry["file"] = zh
                    entry["file_name"] = zf
                    if(self.loading == ZipLoader.IMMEDIATE):
                        entry["content"] = self._load_from_archive(name, zh)
                    self.cache[name] = entry
                 
        except Exception as e:
            pass
            
    
    def _load_from_archive(self, name, zip_file):
        s = BytesIO()
        shutil.copyfileobj(zip_file.open(name, "r"), s)
        return s.getvalue()
    
    def _is_zip_archive(self, path):
        for pattern in ZipLoader._ZIP_ARCHIVE_PATTERNS:
            if (re.match(pattern, path, re.I)):
                return True
        return False
    
    
    def get_resource(self, name):
        rc = self.cache.get(name)
        if rc != None:
            content = rc.get("content")
            if content == None and self.loading == ZipLoader.LAZY:
                    content = self._load_from_archive(name, rc["file"])
                    rc["content"] = content
            return content
        
        return None
    
    def get_resource_str(self, name):
        rc = self.get_resource(name)
        if rc != None:
            #b = BytesIO()
            #shutil.copyfileobj(BytesIO(rc), b)
            #b.write(rc)
            #return b.getvalue()decode()
            return rc.decode()
        return None

class StaticResourcesHandler(BaseMappedHander):
    def do_GET(self, request, response):
        self._load_rc(request, response)
        
    def do_POST(self, request, response):
        self._load_rc(request, response)
    
    def _load_rc(self, request, response):
        path  = request.path[1:] # strip the leading /
        if(len(path) > 2 and path[:2] == "::"):
            rc_path = path[2:]
            if(rc_path != None):
                rc = _DEFAULT_RC_LOADER.get_resource(rc_path)
                if(rc != None):
                    response.headers["Content-Type"] = self._get_mime_type(rc_path)
                    response.write(rc)
                    return
        # send 404 otherwise
        response.send_error(404)
    
    def _get_mime_type(self, path):
        base, ext = posixpath.splitext(path)
        if ext in SimpleHTTPRequestHandler.extensions_map:
            return SimpleHTTPRequestHandler.extensions_map[ext]
        ext = ext.lower()
        if ext in SimpleHTTPRequestHandler.extensions_map:
            return SimpleHTTPRequestHandler.extensions_map[ext]
        else:
            return SimpleHTTPRequestHandler.extensions_map['']
    
def run_server(server_class=HTTPServer, 
         handler_class=SimpleHTTPRequestHandler,
                   port=8000,
                   address=''):
    """
    The most basic HTTP server.
    """
    print("Server is started and listens on port: %d"%port)
    server_address = (address, port)
    httpd = server_class(server_address, handler_class,handlers=[
       {
            "pattern":["/.*"],
            "handler": SimpleHandler(),
            "name": "default",
            "weight": 10
        },
        {
            "pattern":["/::.*"],
            "handler": StaticResourcesHandler(),
            "name": "__static_rc",
            "weight": 0
        }
    ])
    httpd.serve_forever()


# base64 encoded ZIP file of the templates dir and other initial resources
_INITIAL_RC = """
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"""
# -- end of Base 64 string resource
_DEFAULT_RC_LOADER = ZipLoader([BytesIO( base64.b64decode( _INITIAL_RC.encode() ) )])



if __name__ == "__main__":
   print(" :: server staring ...")
   try:
      run_server(DispatcherHTTPServer, DispatcherHTTPHandler)
   except KeyboardInterrupt:
      print ("\n:: forced ::")
   print(" :: server shut down ::")

