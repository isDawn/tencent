import React from 'react';
import Dawn from "../../common/api.js";
require('./search.css');
const STORAGE_SEARCH_HISTORY = 'search_history_storage';
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      arr: [],
      index: -1,
      historyFlag: true,
      historyList: [],
    }, props);
  }

  /**
   *  html seciton
   */
  render() {
    const { arr = [], val, historyFlag, historyList, isUserWrite, index } = this.state;
    const className = 'search-item';
    const active = 'active-item-color';
    const newArr = [];
    return (
      <div className="search-b">
        <input className="search-input" ref='input'
          value={val || ''}
          placeholder="请输入"
          onFocus={this.onLoseAndObtainFocus.bind(this)}
          onBlur={this.onLoseAndObtainFocus.bind(this)}
          onKeyDown={this.keyCode.bind(this)}
          onChange={this.onChange.bind(this)}
        />
        <div className="search-content">
          {
            isUserWrite && val ? arr.map((item, Iindex) => {
              const isTrue = Iindex === index;
              newArr.push(isTrue);
              const newStr = newArr.includes(true) ? item : item.split(val).join(`<font color=red>${val}</font>`)
              return (
                <div className={isTrue ? active : className}
                  onClick={this.itemClick.bind(this, item, Iindex)}
                  key={item}>
                  <p dangerouslySetInnerHTML={{ __html: newStr }} />
                </div>
              )
            }) :
              <History
                historyFlag={historyFlag}
                historyList={historyList}
                index={index}
                itemClick = {this.itemClick.bind(this)}
              />
          }
        </div>
      </div>
    )
  }

  /** 
   * 组件加载
  */
  componentDidMount() { }


  /**
   * 组件卸载
   */
  componentWillUnmount() { }

  onChange() {
    const _val = this.refs.input.value || '';
    const _this = this;
    this.setVal(_val, true);
    if (!_val) {
      this.setState({ arr: [] })
      return false;
    };
    Dawn.request({ url: './fake_data.json' }, (res) => {
      _this.setState({ arr: this.handleBackData(res, _val) });
    });
  }

  handleBackData(res, val) {
    return res.filter((item) => { return item.indexOf(val) !== -1 });
  }

  itemClick(val, index) {
    if (!val) return;
    this.setVal(val, false);
    this.setState({ index: index });
    this.confrimClick(val);
  }

  setVal(val, updateVal) {
    if (updateVal) {
      let isUserWrite = true;
      let index = this.state.index;
      let historyList = [];
      this.userVal = val;
      if (!val) {
        isUserWrite = false;
        index = -1;
        historyList = this.getHistoricalRecords();
      }
      this.setState({ isUserWrite, index, historyList});
    }
    this.setState({ val: val });
  }

  isAssociation(kc) {
    return ((kc === 38 || kc === 40)
      && (this.state.arr || this.state.historyList)
      && (this.state.arr.length > 0 || this.state.historyList.length > 0))
      || kc === 13;
  }

  keyCode(e) {
    const kc = e.keyCode || 0;
    const _val = this.refs.input.value || '';
    if (!this.isAssociation(kc)) return;
    const len = this.isSearch() ? this.state.arr.length : this.state.historyList.length;
    let last = this.state.index;
    if (kc === 38) {
      e.preventDefault();
      if (last === -1) {
        last = len;
      }
      this.setState({ index: --last, }, () => {
        this.setNowItem();
      });
    }
    if (kc === 40) {
      if (last === len - 1) {
        last = -2;
      }
      this.setState({ index: ++last }, () => {
        this.setNowItem();
      });
    }
    if (kc === 13) {
      this.confrimClick(_val);
    }
  }

  isSearch() {
    return this.state.val && this.state.isUserWrite;
  }

  setNowItem() {
    const { index, arr, historyList } = this.state;
    const newArr = this.isSearch() ? arr : historyList;
    if (newArr && newArr.length > 0) {
      let _item = newArr.filter((item, pIndex) => {
        return pIndex === index;
      })
      if (index === -1) {
        _item = this.userVal;
      }
      this.setVal(_item);
    }
  }


  onLoseAndObtainFocus(e) {
    const tp = e.type || '';
    const _index = -1;
    if (tp === 'focus') {
      // 聚焦
      this.setState({ index: _index ,historyList:this.getHistoricalRecords()});
    };
    if (tp === 'blur') {
      // 失焦
    };
  }

  /*** 
   * @param {String} val 用户选中的内容
  */
  confrimClick(val) {
    if (!val) return false;
    console.log('click confirm ?', val)
    this.setHistoricalRecords(val);
  }


  /*** 
   * const STORAGE_SEARCH_HISTORY : search_history_storage;
  */
  setHistoricalRecords(val) {
    let newArr = this.getHistoricalRecords();
    let existence = newArr.some((item)=>{ return item === val;}) 
    if (existence) return;
    newArr.push(val);
    console.log('set_storage---',newArr)
    localStorage.setItem(STORAGE_SEARCH_HISTORY,JSON.stringify(newArr));
  }

  getHistoricalRecords() {
    const getStorageData = localStorage.getItem(STORAGE_SEARCH_HISTORY)  || '[]';
    return JSON.parse(getStorageData);
  }

  rmHistoricalRecords(val) {

  }
}


// history

export class History extends React.Component {
  constructor(props) {
    super(props)
    this.props = props;
    if (!this.props.historyFlag) return;
  }


  /** 
   * history----html
  */
  render() {
    const { historyList, index } = this.props;
    if (!historyList || historyList.length === 0) return false;
    return (
      <div className="search-history" >
        {
          historyList.map((item, hIndex) => {
            const isChoice = index === hIndex;
            return (
              <div
                className={isChoice ? 'history-item-color' : 'history-item'}
                key={item}
                onClick = {this.props.itemClick ? ()=>{this.props.itemClick(item,hIndex)} : ''}>
                  {item}
              </div>
            )
          })
        }
        <div className = 'close-history'>
          <div>关闭历史记录</div>
        </div>
      </div>
    )
  }
}
