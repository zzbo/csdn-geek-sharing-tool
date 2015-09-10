var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var panel = require("sdk/panel");
var Request = require("sdk/request").Request;
let { Cc, Ci, Cu } = require('chrome');


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
  //tabs.open("http://www.mozilla.org/");
  //wiki : https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Display_a_Popup
	var p = panel
  .Panel({
		width : 300,
		height : 400,
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

  p.show();

  //监听发布
  p.port.on('publish', function (data) {
    console.log('>>> publish');
    console.log('postData: ', data);
    var publishUrl = 'http://geek.csdn.net/service/news/add_edit';
    
    Post(publishUrl, data, function (data) {
      console.log(data);
      if (data.status === 1) {
        p.port.emit('publishSuccess', data);
      }
      else {
        p.port.emit('error', data);
      }
    });
  });

  p.port.emit('setFormData', {
    url: tabs.activeTab.url,
    title: tabs.activeTab.title,
    username : GetCookie('UN')
  });

  getCateList(p);
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
        success && success(data.json);
      }
      else {
        error && error(data.json);
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
        success && success(data.json);
      }
      else {
        error && error(data.json);
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
