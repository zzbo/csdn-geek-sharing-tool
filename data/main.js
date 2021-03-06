$(function () {
  var jqWrap = $('.wrap');
  var jqMainTitle = $('#J-share-main-title');
  var jqShareUrl = $('#J-share-url');
  var jqShareTitle = $('#J-share-title');
  var jqCateList = $('#J-catelist');
  var jqReason = $('#J-share-reason');
  var jqUserName = $('#J-username');
  var jqPublish = $('#J-publish');
  var jqTip = $('#J-tip');
  var jqTitleError = $('#J_title_error');
  var jqCateListError = $('#J_catelist_error');
  var jqCloseBtn = $('#J-close-btn');
  var jqPubSuccess = $('#J-pub-success');

  //插件通信
  self.port.on('setFormData', function (data) {
    console.log('setFormData', data);
    jqShareUrl.val(data.url);
    jqShareTitle.val(data.title);
    jqUserName.val(data.username);
  });

  //子社区列表
  self.port.on('cateList', function (data) {
    createCate(data);
  });

  //发布分享成功
  self.port.on('publishSuccess', function (data) {
    jqPubSuccess.show().nextAll().remove();
    jqWrap.css('height', 'auto');
    setTimeout(function () {
      self.port.emit('closeMainPanel', 'closeMainPanel');
    }, 2000);
  });

  //显示错误提示
  self.port.on('error', function (data) {
    jqTip.html(data.error).show();
    setTimeout(function () {
      jqTip.fadeOut();
      self.port.emit('closeMainPanel', 'closeMainPanel');
    }, 3000);
  });

  jqPublish.on('click', function () {
    var title = jqShareTitle.val();
    var forum_id = jqCateList.val();
    var postData;
    jqTitleError.hide();
    jqCateListError.hide();

    if (!title) {
      jqTitleError.css('display', 'inline-block');
    }
    else if (forum_id == -1) {
      jqCateListError.css('display', 'inline-block');
    }
    else {
      postData = {
        title : jqShareTitle.val(),
        forum_id : jqCateList.val(),
        url : jqShareUrl.val(),
        description : jqReason.val(),
        username : jqUserName.val()
      }

      self.port.emit('publish', postData);
    }
  });

  //关闭按钮事件绑定
  jqCloseBtn.on('click', function () {
    self.port.emit('closeMainPanel', 'closeMainPanel');
  });

  $('a').on('click', function (e) {
    var link = $(this).attr('href');
      link = link.indexOf('/') === 0 ? (passportLink + link) : link;

      self.port.emit('openLink', {
        url : link
      });

    e.preventDefault();
  });

  //生成社区列表
  function createCate (data) {
    var tmpl = [];
    data.forEach(function (n) {
      tmpl.push('<option value="' + n.id + '">');
      tmpl.push(n.name);
      tmpl.push('</option>');
    });
    jqCateList.append(tmpl.join('')).show();
  }
});


// http://ink.csdn.net/articles/show/55ec359bd076e95f4f672646