$(function () {
  var jqShareUrl = $('#J-share-url');
  var jqShareTitle = $('#J-share-title');
  var jqCateList = $('#J-catelist');
  var jqReason = $('#J-share-reason');
  var jqUserName = $('#J-username');
  var jqPublish = $('#J-publish');
  var jqTip = $('#J-tip');

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
    jqTip.html('已成功分享该文章!').show();
    setTimeout(function () {
      jqTip.fadeOut();
    }, 3000);
  });

  //显示错误提示
  self.port.on('error', function (data) {
    jqTip.html(data.error).show();
    setTimeout(function () {
      jqTip.fadeOut();
    }, 3000);
  });

  jqPublish.on('click', function () {
    var postData = {
      title : jqShareTitle.val(),
      forum_id : jqCateList.val(),
      url : jqShareUrl.val(),
      description : jqReason.val(),
      username : jqUserName.val()
    }

    self.port.emit('publish', postData);
  });

  //生成社区列表
  function createCate (data) {
    var tmpl = [];
    data.forEach(function (n) {
      tmpl.push('<option value="' + n.id + '">');
      tmpl.push(n.name);
      tmpl.push('</option>');
    });
    $('#J-catelist-loading').hide();
    jqCateList.append(tmpl.join('')).show();
  }
});


// http://ink.csdn.net/articles/show/55ec359bd076e95f4f672646