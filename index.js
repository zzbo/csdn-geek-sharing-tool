var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var panel = require("sdk/panel");
var Request = require("sdk/request").Request;
let { Cc, Ci, Cu } = require('chrome');
let { getActiveView }=require("sdk/view/core");
var DOMParser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);

var button = buttons.ActionButton({
  id: "csdnGeek",
  label: "csdnGeek",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

function handleClick (state) {
  if (GetCookie('UserInfo')) {
    console.log('已登录');
    mainPanel();
  }
  else {
    console.log('未登录');
    loginPanel();
  }
}

//登录面板
function loginPanel () {
  var loginUrl = 'https://passport.csdn.net/';
  var loginP = panel
  .Panel({
    width : 330,
    height : 500,
    position: button,
    contentURL: self.data.url("login.html"),
    contentScriptFile: [
      self.data.url("jquery-2.1.3.js"),
      self.data.url("login.js")
    ],
    contentStyleFile: [
      self.data.url('login.css')
    ]
  });
  getActiveView(loginP).setAttribute("noautohide", true);

  //打开登录面板
  loginP.show();

  //获取登录页面
  Get(loginUrl, null, function (data) {
    if (data.status === 200) {
      var doc = DOMParser.parseFromString(data.text, 'text/html');
      var loginHtml = doc.querySelectorAll('.login-part')[0].outerHTML;

      loginP.port.emit('loginPart', {
        loginHtml : loginHtml
      });
    }
    else {
      loginP.port.emit('error', {
        error : '请求登录接口出错'
      });
    }
  });

  //打开新页面
  loginP.port.on('openLink', function (data) {
    tabs.open(data.url);
    loginP.hide();
  });

  //登录
  loginP.port.on('loginSubmit', function (formData) {
    Post('https://passport.csdn.net/', formData, function (data) {
      if (GetCookie('UserInfo')) {
        //登录成功
        console.log('loginSuccess');
        loginP.hide();
        mainPanel();
      }
      else {
        //登录失败
        loginP.port.emit('loginFail', 'loginFail');
      }
    });
  });

  loginP.port.on('closeMainPanel', function () {
    loginP.hide();
  });
}

//主面板
function mainPanel () {
  //wiki : https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Display_a_Popup
  var mainP = panel
  .Panel({
    width : 330,
    height : 550,
    position: button,
    contentURL: self.data.url("main.html"),
    contentScriptFile: [
      self.data.url("jquery-2.1.3.js"),
      self.data.url("main.js")
    ],
    contentStyleFile: [
      self.data.url('main.css')
    ]
  });
  getActiveView(mainP).setAttribute("noautohide", true);

  mainP.show();

  //监听发布
  mainP.port.on('publish', function (data) {
    console.log('>>> publish');
    console.log('postData: ', data);
    var publishUrl = 'http://geek.csdn.net/service/news/add_edit';
    
    Post(publishUrl, data, function (data) {
      console.log(data);
      if (data.status === 1) {
        mainP.port.emit('publishSuccess', data);
        mainP.resize(330, 180);
      }
      else {
        mainP.port.emit('error', data);
      }
    });
  });

  //设置表单数据
  mainP.port.emit('setFormData', {
    url: tabs.activeTab.url,
    title: tabs.activeTab.title,
    username : GetCookie('UN')
  });

  //打开新页面
  mainP.port.on('openLink', function (data) {
    tabs.open(data.url);
    mainP.hide();
  });

  //关闭弹层
  mainP.port.on('closeMainPanel', function () {
    mainP.hide();
  });

  getCateList(mainP);
}

//获取社区列表
function getCateList (p) {
  var cateListUrl = 'http://geek.csdn.net/service/news/forums';
  Get(cateListUrl, null, function (data) {
    if (data.status === 1) {
      p.port.emit('cateList', data.data);
    }
    else {
      p.port.emit('error', data);
    }
  });
}

/**
 * 给接口发送数据
 * @param {String}   url      目标接口地址
 * @param {Object}   data     数据
 * @param {Function} success 请求成功执行回调函数
 * @param {Function} error 请求失败执行回调函数
 */
function Get (url, data, success, error) {
  Request({
    url : url,
    content : data,
    onComplete : function (data) {
      if (data.status === 200) {
        success && success(data.json || data);
      }
      else {
        error && error(data.json || data);
      }
    }
  }).get();
}

/**
 * 给接口发送数据(POST)
 * @param {String}   url      目标接口地址
 * @param {Object}   data     数据
 * @param {Function} success 请求成功执行回调函数
 * @param {Function} error 请求失败执行回调函数
 */
function Post (url, data, success, error) {
  Request({
    url : url,
    content : data,
    onComplete : function (data) {
      if (data.status === 200) {
        success && success(data.json || data);
      }
      else {
        error && error(data.json || data);
      }
    }
  }).post();
}

//获取cookie
//如果需要用cookie来判断登录状态时使用
function GetCookie (name) {
  try {
    console.log("Getting Cookies");
    var cookie = {};
    var ios = Cc["@mozilla.org/network/io-service;1"]
              .getService(Ci.nsIIOService);
    var uri = ios.newURI("http://www.csdn.net/", null, null);

    var cookieSvc = Cc["@mozilla.org/cookieService;1"]
                    .getService(Ci.nsICookieService);
    var cookieStr = cookieSvc.getCookieString(uri, null);
    
    if (cookieStr) {
      cookieStr.split(';').forEach(function (n) {
        n = n.trim();
        if (!!n) {
          var pairs = n.split('=');
          cookie[pairs[0]] = pairs[1];
        }
      });
    }
    return cookie[name];
  }
  catch (errorInfo) {
      console.log(errorInfo);
  }
}

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;
