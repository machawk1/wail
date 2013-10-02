import gzip

archive_types = []

def is_gzip_file(file_handle):
    signature = file_handle.read(2)
    file_handle.seek(-len(signature),1)
    return signature == '\x1f\x8b'

def guess_record_type(file_handle):
    offset = file_handle.tell()
    if is_gzip_file(file_handle):
        nfh=gzip.GzipFile(fileobj=file_handle)
    else:
        nfh=file_handle
    
    line = nfh.readline()
    file_handle.seek(offset)
    for rx, record in archive_types:
        if rx.match(line):
            return record

    else:
        return None

def register_record_type(rx, record):
    archive_types.append((rx,record))
