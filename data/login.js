$(function () {
  var jqWrap = $('.wrap');
  var jqCloseBtn = $('#J-close-btn');
  var passportLink = 'https://passport.csdn.net/';

  self.port.on('loginPart', function (data) {
    jqWrap.html(data.loginHtml);

    jqWrap.find('.login-part > h3').html('CSDN帐号登录');
    jqWrap.find('.forget-password span').eq(0).remove(); //去掉自动登录
    jqWrap.find('a').on('click', function (e) {
      var link = $(this).attr('href');
      link = link.indexOf('/') === 0 ? (passportLink + link) : link;

      self.port.emit('openLink', {
        url : link
      });

      e.preventDefault();
    });

    jqWrap.find('.logging').on('click', submitLogin);

    
    $(document).on('keydown', function (e) {
      if (e.keyCode == 13) {
        submitLogin();
      }
    });

    //监听登录失败
    self.port.on('loginFail', function () {
      showError('帐户名或登录密码不正确，请重新输入');
    });

    //关闭按钮事件绑定
    jqCloseBtn.on('click', function () {
      self.port.emit('closeMainPanel', 'closeMainPanel');
    });
  });

  function submitLogin () {
    var username = $('#username').val();
    var password = $('#password').val();
    var lt = jqWrap.find('input[name=lt]').val();
    var execution = jqWrap.find('input[name=execution]').val();
    var _eventId = jqWrap.find('input[name=_eventId]').val();

    if (!username) {
      showError('请输入用户名！');
    }
    else if (!password) {
      showError('请输入密码！');
    }
    else {
      self.port.emit('loginSubmit', {
        username : username,
        password : password,
        lt : lt,
        execution : execution,
        _eventId : _eventId
      });
    }
  }
  
  /**
   * 显示错误提示
   * @param  {String} errorMsg 错误信息
   */
  function showError (errorMsg) {
    jqWrap.find('.error-mess').show();
    $('#error-message').html(errorMsg);
  }  
});


// http://ink.csdn.net/articles/show/55ec359bd076e95f4f672646