import * as address from './addressbook'
// import jsonp from 'fetch-jsonp'

let jQuery = window.$

function jsonp ( url, data = {}, opt = {} ) {
  return function ( successFn, errorFn ) {
    jQuery.ajax({
      url: url,
      async: false,
      type: "GET",
      dataType: "jsonp",
      jsonp: 'jsonp' in opt ? opt.jsonp : "callback",
      data: data,
      cache: 'cache' in opt ? opt.cache : true,
      success: function ( response ) {
        if( successFn ) successFn( response )
      },
      error: function ( error ){
        if( errorFn ) errorFn( error )
      }
    })
  }
}

function post ( url, data={} ) {
  return function ( successFn, errorFn ) {
    jQuery.ajax({
      url: url,
      type: "POST",
      dataType: "json",
      data: data,
      cache: true,
      success: function ( response ) {
        if( successFn ) successFn( response )
      },
      error: function ( error ){
        if( errorFn ) errorFn( error )
      }
    })
  }

}

// user services
export function updateFavList () {
  return jsonp(
    address.SHENBIAN_API + '/favorites/getlist'
  )
}

export function addUserCollect (pguid, type, sn) {
  return jsonp(
    address.SHENBIAN_API + '/favorites/add',
    {
      pguid,
      type,
      sn
    }
  )
}

export function cancelUserCollect (id) {
  return jsonp(
    address.SHENBIAN_API + '/favorites/delete?param=' + id,
  )
}

export function sendMessage (info) {
  return post( "/app/sms/send", {
    sign: info.sign,
    content: info.content,
    'phones[]': info.phone,
    time: info.time,
    captcha: info.valid,
    'new': 1,
  })
}

export function getUserLocation (ak, ip) {
  return jsonp(
    '//api.map.so.com/local',
    {
      apikey: ak,
      cip: ip,
      ad: 1,
  })
}

let __debug = !!0;
export function updateUserLocation (info) {
  return jsonp(
    __debug ? "http://ditu.so.com/app/hp" : "/app/hp",
    {

      'act': 'addposition',
      'location': info.y + ',' + info.x,
  })
}

export function handlePop (sms_param) {
  return jsonp(
    address.MSG_REVIEW_API + "?" + sms_param,
  )
}

// menu services
export function getMenuWeather ( code ) {
  return jsonp(
    'https://p.ssl.haosou.com/p/' + encodeURIComponent(address.WEATHER_API + '&code=' + code),
    null,
    {
      jsonp: '_callback'
    }
  )
}

export function getRealTrafficTime() {
  return jsonp(
    address.REAL_TRAFFIC_TIME_API,
    {
      act: 'time',
    },
    {
      cache: false,
      jsonp: 'jsoncallback'
    }
  )
}
