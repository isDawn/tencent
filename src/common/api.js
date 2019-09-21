/* eslint-disable no-unused-vars */
import Oath from './Promise.js';
class Dawn {

    /*** 
     * @param {Object} 入参
     * @param {Function} 回调
    */
    static request(param) {
        return new Oath((resolve, reject) => {
                fetch(param.url, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                }).then(
                    response => response.json()
                ).then(res => {
                    resolve(res);
                })
        })
    }


    /*** 
     * @param {String} funType // 方法类型
     * @param {Number} timer // 延时时间
     * @param {Object} _this // this
    */
    static throttle(funType, timer, _this) {
        if (!funType || !timer || !_this) {
            return false;
        }
        if (!_this.throttleObj) {
            _this.throttleObj = {};
        }
        const arr = _this.throttleObj[funType] || [];
        const timeStamp = new Date().getTime();
        if (arr && arr.length > 0 && arr[0] && arr[1] && timeStamp - arr[0] < arr[1]) {
            return true;
        } else {
            _this.throttleObj[funType] = [timeStamp, timer];
            return false;
        }
    }


    //  native-dawn.js


    /** 
     * @param {Object | Array} param_one
     * @param {Object | Array} param_two
     */

    static objCompare(param_one, param_two) {
        if (!this.isObj(param_one, param_two) && !this.isArray(param_one, param_two)) {
            throw new Error("Parameter type error");
        }
        return this.isSame(param_one, param_two);
    }

    static isSame(a, b) {
        if (!this.judgeLength(a, b)) return false;
        if (this.isArray(a, b)) {
            for (let i = 0, len = a.length; i < len; i++) {
                if (this.isArray(a[i], b[i]) || this.isObj(a[i], b[i])) {
                    if (!this.isSame(a[i], b[i])) return false;
                    continue;
                }
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
        if (this.isObj(a, b)) {
            for (let key in a) {
                if (this.isArray(a[key], b[key]) || this.isObj(a[key], b[key])) {
                    if (!this.isSame(a[key], b[key])) return false;
                    continue;
                }
                if (a[key] !== b[key]) return false;
            }
            return true;
        }
        if (a !== b) return false;
        return true;
    }

    static judgeLength(a, b) {
        if (this.isObj(a, b)) {
            return Object.keys(a).length === Object.keys(b).length;
        }
        if (this.isArray(a, b)) {
            return a.length === b.length;
        }
    }

    static isObj(param_one, param_two) {
        return this._isObj(param_one) && this._isObj(param_two);
    }

    static isArray(param_one, param_two) {
        return this._isArray(param_one) && this._isArray(param_two);
    }

    static _isObj(value) {
        return Object.prototype.toString.call(value) === "[object Object]";
    }

    static _isArray(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }
}
// 获取Dawn源数据中可外部使用的function
const { request, throttle, objCompare } = Dawn;
// 抛出可用外部方法以供使用
export {
    request, //sever请求
    throttle, // 时间戳节流
    objCompare // 是否相同obj or array
}