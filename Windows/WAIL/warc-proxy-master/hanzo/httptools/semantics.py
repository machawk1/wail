"""
Semantics as based upon
http://tools.ietf.org/html/draft-ietf-httpbis-p2-semantics-17
"""

class Methods(object):
    GET = 'GET'
    PUT = 'PUT'
    HEAD = 'HEAD'
    DELETE = 'DELETE'
    POST = 'POST'
    OPTIONS = 'OPTIONS'
    TRACE = 'TRACE'
    PATCH = 'PATCH'
    CONNECT = 'CONNECT'
    safe = (GET, HEAD, OPTIONS, TRACE,)
    idempotent = (PUT, DELETE,)
    no_body = (HEAD,)
    cacheable = (GET,) 


def range_collection(func):
    """Returns an object (x) that responds to foo in x,"""

    class Range(object):
        def __contains__(self, item):
            return func(item)

    return Range()
                

class Codes(object):
    #pylint: disable-msg=e0213
    Continue = 100
    switching_protocols = 101

    @range_collection
    def informational(code):
        return 100 <= code < 200

    ok = 200
    created = 201
    accepted = 202
    non_authorative_content = 203
    no_content = 204
    reset_content = 205
    partial_content = 206

    @range_collection
    def successful(code):
        return 200 <= code < 300


    moved_permanently = 301
    found = 302
    see_other = 303
    not_modified = 304
    use_proxy = 305
    obsolete_switch_proxy = 306
    temporary_redirect = 307

    @range_collection
    def redirection(code):
        return 300 <= code < 400


    bad_request = 400
    unauthorized = 401
    payment_required = 402
    forbidden = 403
    not_found = 404
    method_not_allowed = 405
    not_acceptable = 406
    proxy_authentication_required = 407
    request_timeout = 408
    conflict = 409
    gone = 410
    length_required = 411
    precondition_failed = 412
    request_representation_too_large = 413
    uri_too_long = 414
    unsupported_media_type = 415
    requested_range_not_satisfiable =415
    expectation_failed = 417
    upgrade_required = 426

    @range_collection
    def client_error(code):
        return 400 <= code < 500


    internal_server_error = 501
    not_implemented = 501
    bad_gateway = 502
    service_unavailable = 503
    gateway_timeout = 504
    http_version_not_supported = 505
    @range_collection
    def server_error(code):
        return 500 <= code < 600

    @range_collection
    def no_body(code):
        return (100 <= code < 200) or (code == 204) or (code == 304)

