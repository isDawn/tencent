import React from 'react';
import his_img_url from "../../assets/img/rm-his.jpg";
import eye_img_url from "../../assets/img/eye.png";
/** 
 * @param {Object} props 
 * content 部分
*/
const Content = function(props) {
    const { index, val, arr } = props;
    const array = [];
    return (
      arr.map((item, Iindex) => {
        const isTrue = Iindex === index;
        array.push(isTrue);
        const newStr = array.includes(true) ? item : item.split(val).join(`<font color=red>${val}</font>`)
        return (
          <div className={isTrue ? 'active-item-color' : 'search-item'}
            key = {item}
            onClick={()=>{props.itemClick(item, Iindex)}}>
            <p dangerouslySetInnerHTML={{ __html: newStr }} />
          </div>
        )
      })
    )
  }


  const HistoryContent = function(props) {
    const { historyFlag, historyList, index } = props; 
    if (!historyFlag) {
      return false;
    }
    return (
      historyList.map((item, hIndex)=> {
        const isChoice = hIndex === index;
        return (
          <div
            className={isChoice ? 'history-item-color' : 'history-item'}
            onDoubleClick={()=>{props.onDoubleClick(item, hIndex)}}
            onClick={props.itemClick ? () => { props.itemClick(item, hIndex) } : ''}
            key = {item}
          >
            {item}
          </div>
        )
      })
    )
  }

  const CloseHistory = function(props) {
    if (!props.historyFlag || !props.historyList || props.historyList.length === 0) {
      return '';
    }
    return (
      <div className='close-history'>
        <div onClick={()=>{props.closeHistory()}}>关闭历史记录</div>
      </div>
    )
  }
  
  const ClearHistory = function(props) {
    if (!props.rmHistoricalP) {
      return '';
    }
    return (
      <div className='rm-history-b'>
        <div>
          <img src={his_img_url} alt=""/>
          <div onClick={()=>{props.rmHistory(false)}}>删除当前历史</div>
          <div onClick={()=>{props.rmHistory(true)}}>删除全部历史</div>
          <div onClick={props.rmBack}>返回</div>
        </div>
      </div>
    )
  }

  const Switch = function(props) {
    if (props.historyFlag) {
      return '';
    }
    return (
      <img className='eyes' alt="" src = {eye_img_url} onClick = {props.openHistory} />
    )
  }

  export {
      Content,
      CloseHistory,
      ClearHistory,
      HistoryContent,
      Switch
  }