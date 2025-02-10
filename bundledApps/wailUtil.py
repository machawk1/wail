import shutil
import errno
import os
import sys


def tail(filename, lines : int = 1, _buffer : int = 4098) -> list | str:
    try:
        f = open(filename, "r", encoding="utf-8")
    except IOError as e:
        return (
            "No job info yet\n"
            "You must run a job before stats can be shown here")
    lines_found = []
    block_counter = -1
    while len(lines_found) < lines:
        try:
            f.seek(block_counter * _buffer, os.SEEK_END)
        except IOError:
            # either file is too small, or too many lines requested
            f.seek(0)
            lines_found = f.readlines()
            break

        lines_found = f.readlines()
        if len(lines_found) > lines:
            break
        block_counter -= 1
    return lines_found[-lines:]


def copy_anything(src, dst) -> None:
    try:
        shutil.copytree(src, dst)
    except OSError as exc:  # python >2.5
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dst)
        else:
            raise

# https://stackoverflow.com/questions/3431825/generating-an-md5-checksum-of-a-file
def hash_bytestr_iter(bytesiter, hasher, ashexstr : bool = False):
    for block in bytesiter:
        hasher.update(block)
    return hasher.hexdigest() if ashexstr else hasher.digest()

def file_as_blockiter(afile, blocksize=65536):
    with afile:
        block = afile.read(blocksize)
        while len(block) > 0:
            yield block
            block = afile.read(blocksize)

def is_macOS() -> bool:
    return 'darwin' in sys.platform

def is_linux() -> bool:
    return sys.platform.startswith('linux')

def is_windows() -> bool:
    return sys.platform.startswith('win32')
