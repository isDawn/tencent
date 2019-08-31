export default class Dawn {

    /*** 
     * @param {Object} 入参
     * @param {Function} 回调
    */
   static request(param,callBack) {
        fetch(param.url , {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        }).then(
            response => response.json()
        ).then(res => {
            callBack(res)
        })
    }
}