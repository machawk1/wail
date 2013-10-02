import sys

__all__ = ['debug']

if __debug__:
    def debug(*args):
        print >> sys.stderr, 'WARCTOOLS',args
else:
    def debug(*args):
        pass
    
