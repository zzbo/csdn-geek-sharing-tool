$(function () {
  var jqShareUrl = $('#J-share-url');
  var jqShareTitle = $('#J-share-title');
  var jqPublish = $('#J-publish');
  var jqCateList = $('#J-catelist');
  var jqReason = $('#J-share-reason');

  //插件通信
  self.port.on('setFormData', function (data) {
    console.log('setFormData', data);
    jqShareUrl.val(data.url);
    jqShareTitle.val(data.title);
  });

  self.port.on('cateList', function (data) {
    createCate(data);
  });

  jqPublish.on('click', function () {
    var postData = {
      title : jqShareTitle.val(),
      forum_id : jqCateList.val(),
      url : jqShareUrl.val(),
      description : jqReason.val()
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