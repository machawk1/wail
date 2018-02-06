import shutil
import errno
import os


def tail(filename, lines=1, _buffer=4098):
    try:
        f = open(filename, "r")
    except IOError as e:
        return '{0}\n{1}'.format(
            "No job info yet",
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


def copyanything(src, dst):
    try:
        shutil.copytree(src, dst)
    except OSError as exc:  # python >2.5
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dst)
        else:
            raise
