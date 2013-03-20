window.addonType = window.addonType || null;
window.proxyRoot = window.proxyRoot || '';

$(function(){

  function convertDataToNodes(data, collapse) {
    var nodes = [];
    if (data.children) {
      for (var i in data.children) {
        var children = convertDataToNodes(data.children[i], true);
        if (collapse && children.length == 1 && !data.children[i].uri) {
          var node = {
            title: i + children[0].title,
            uri: children[0].uri,
            isFolder: children[0].isFolder,
            children: children[0].children
          };
          nodes.push(node);
        } else {
          var node = {
            title: i,
            uri: data.children[i].uri,
            isFolder: (children.length > 0),
            children: children
          };
          nodes.push(node);
        }
      }
    }
    nodes.sort(function(a,b) {
      return (a.title < b.title) ? -1 : (a.title == b.title) ? 0 : 1;
    });
    return nodes;
  }

  function onClick_radioMimetypeButton(e) {
    var mimetypeBtn = $(e.target),
        li = mimetypeBtn.parents('li.file'),
        treeDiv = li.children('div.tree'),
        tree = treeDiv.dynatree('getTree');
    tree.options.initAjax.data.mime_type = mimetypeBtn.attr('data-mimetype');
    tree.reload();
  }

  function pathNameToId(path) {
    return path.replace(/[^-_a-zA-Z0-9]/g, '_');
  }

  function addFile(path) {
    $('#fileBrowserDialog').modal('hide');

    var basename = path.match(/[^\/\\]+$/)[0];
    var li_id = 'file-' + pathNameToId(path);
    if (document.getElementById(li_id)) {
      return;
    }

    var li = document.createElement('li');
    li.id = li_id;
    li.className = 'file file-loading';
    $(li).append(
      '<h2></h2>' +
      '<div class="btn-toolbar">' +
        '<div class="btn-group radio-mimetype" data-toggle="buttons-radio">' +
          '<button type="button" class="btn btn-small mimetype-text" data-mimetype="text/(plain|html)">Text</button>' +
          '<button type="button" class="btn btn-small" data-mimetype="image/">Images</button>' +
          '<button type="button" class="btn btn-small" data-mimetype=".">All</button>' +
        '</div>' +
        '<a href="#" class="btn btn-small pull-right btn-remove-file"><i class="icon-remove-sign"></i></a>' +
        '<div class="progress progress-striped active"><div class="bar" style="width: 0%"></div></div>' +
      '</div>' +
      '<div class="tree"></div>'
    );
    $(li).attr('data-path', path);
    $('h2', li).text(basename);
    $('.radio-mimetype button.mimetype-text', li).button('toggle');
    $('.radio-mimetype button', li).click(onClick_radioMimetypeButton);
    $('.btn-remove-file', li).click(onClick_unloadFile);
    $('#files-list').append(li);

    loadWarc(path, li.id);
  }

  function prepareFileUriTree(path, li_id) {
    $('#'+li_id+' .tree').dynatree({
      onActivate: function(node) {
        if (node.data.uri) {
          navigateToArchivedUri(node.data.uri);
        }
      },
      classNames: {
        nodeIcon: 'icon-dynatree'
      },
      initAjax: {
        url: window.proxyRoot+'/index.json', dataType: 'json',
        data: { path: path, mime_type: 'text/(plain|html)' },
        postProcess: function(d) { return convertDataToNodes(d); }
      }
    });
  }

  var loadWarcTimeouts = {};
  function loadWarc(path, li_id) {
    if (loadWarcTimeouts[path]) {
      window.clearTimeout(loadWarcTimeouts[path]);
    }

    $.ajax({
      url: window.proxyRoot+'/load-warc',  type: 'POST', data: { path: path },
      dataType: 'json',
      success: function(data) {
        if (data.status == 'indexed') {
          $('#'+li_id).removeClass('file-loading');
          $('#'+li_id+' .progress').remove();
          prepareFileUriTree(path, li_id);

          updateProxyStatus();

        } else {
          if (data.bytes_read) {
            var perc = (100 * data.bytes_read / data.bytes_total);
            $('#'+li_id+' .progress .bar').css('width', perc+'%');
          }

          loadWarcTimeouts[path] = window.setTimeout(function() {
            loadWarc(path, li_id);
          }, 500);
        }
      }
    });
  }
  function unloadWarc(path) {
    if (loadWarcTimeouts[path]) {
      window.clearTimeout(loadWarcTimeouts[path]);
    }

    var li_id = 'file-'+pathNameToId(path);
    $.ajax({
      url: window.proxyRoot+'/unload-warc',  type: 'POST', data: { path: path },
      dataType: 'json',
      success: function(data) {
        $('#'+li_id).remove();

        updateProxyStatus();
      }
    });
  }
  function updateProxyStatus() {
    $.ajax({
      url: window.proxyRoot+'/list-warcs',  type: 'GET',
      dataType: 'json',
      success: function(data) {
        var t = data.paths.length;
        t += ' archive';
        if (data.paths.length != 1) {
          t += 's';
        }
        t += ', ' + data.uri_count + ' URL';
        if (data.uri_count != 1) {
          t += 's';
        }
        $('#global-stats').text(t);

        var currentFiles = $('li.file');
        for (var i=0; i<currentFiles.length; i++) {
          var path = $(currentFiles[i]).attr('data-path');
          if (data.paths.indexOf(path) == -1) {
            unloadWarc(path);
          }
        }
        for (var i=0; i<data.paths.length; i++) {
          var li_id = 'file-' + pathNameToId(data.paths[i]);
          if (!document.getElementById(li_id)) {
            addFile(data.paths[i]);
          }
        }

        $('#proxy-unavailable').css('display', 'none');
      },
      timeout: 1000,
      error: function() {
        $('#proxy-unavailable').css('display', 'block');
      }
    });
  }

  function onClick_unloadFile(e) {
    e.stopPropagation();
    var path = $(e.target).parents('li.file').attr('data-path');
    unloadWarc(path);
    return false;
  }

  updateProxyStatus();
  window.setInterval(updateProxyStatus, 5000);


  if (window.addonType == 'mozilla') {

    $('#add-an-archive-button').click(function(e) {
      e.stopPropagation();
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent("addon-request-open-warc-file", true, true, {});
      document.documentElement.dispatchEvent(event);
      return false;
    });

    document.documentElement.addEventListener("addon-open-warc-file", function(event) {
      if (event.detail.pathname) {
        addFile(event.detail.pathname);
      }
    }, false);

    document.documentElement.addEventListener("addon-proxy-enabled", function(event) {
      $('#proxy-disabled').css('display', 'none');
    }, false);

    function navigateToArchivedUri(uri) {
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent("addon-request-navigate", true, true, { uri: uri });
      document.documentElement.dispatchEvent(event);
    }

    $('#start-proxying-button').click(function(e) {
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent("addon-request-toggle-proxy", true, true, { new_state: true });
      document.documentElement.dispatchEvent(event);
    });

    $('body').addClass('addon-mozilla');
    $('#proxy-disabled').css('display', 'block');

  } else {

    $('#add-an-archive-button').click(function(e) {
      e.stopPropagation();
      $('#fileBrowserDialog').modal('show');
      return false;
    });

    $('#fileBrowserTree').dynatree({
      onActivate: function(node) {
        if (node.data.is_warc) {
          $('#fileBrowserPath').attr('value', node.data.path);
        }
      },
      initAjax: {
        url: window.proxyRoot+'/browse.json', dataType: 'json', data: { path: '/' }
      },
      onLazyRead: function(node) {
        node.appendAjax({
          url: window.proxyRoot+'/browse.json', dataType: 'json', data: { path: node.data.path }
        });
      }
    });

    $('#form-add-file').submit(function(e) {
      e.stopPropagation();
      addFile(document.getElementById('fileBrowserPath').value);
      return false;
    });

    function navigateToArchivedUri(uri) {
      parent.archived_page.location.href = uri;
    }

  }

});

