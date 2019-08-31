import React from 'react';
import Dawn from "../../common/api.js";
require('./search.css');
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      arr: [],
      index: -1
    }, props);
  }

  /**
   *  html seciton
   */ 
  render() {
    const { arr = [], val } = this.state;
    const className = 'search-item';
    const active = 'active-item-color';
    const newArr = [];
    return (
      <div className="search-b">
        <input className="search-img" ref='input'
          value={val || ''}
          placeholder="请输入"
          onFocus={this.onLoseAndObtainFocus.bind(this)}
          onBlur={this.onLoseAndObtainFocus.bind(this)}
          onKeyDown={this.keyCode.bind(this)}
          onChange={this.onChange.bind(this)}
        />
        <div className="search-content">
          {
            arr.map((item, index) => {
              const isTrue = index === this.state.index;
              newArr.push(isTrue);
              const newStr = newArr.includes(true) ? item : item.split(val).join(`<font color=red>${val}</font>`)
              return (
                <div className={isTrue ? active : className}
                  onClick={this.itemClick.bind(this, item, index)}
                  key={item}>
                  <p dangerouslySetInnerHTML={{ __html: newStr }} />
                </div>
              )
            })
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
    this.setVal(val, false, index);
    this.setState({ index: index });
  }

  setVal(val, updateVal) {
    if (updateVal) {
      this.userVal = val;
    }
    this.setState({ val: val });
  }

  isAssociation(kc) {
    return (kc === 38 || kc === 40) && this.state.arr && this.state.arr.length > 0
  }

  keyCode(e) {
    const kc = e.keyCode || 0;
    if (!this.isAssociation(kc)) return;
    const len = this.state.arr.length;
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
  }

  setNowItem() {
    const { index, arr } = this.state;
    if (arr && arr.length > 0) {
      let _item = arr.filter((item, pIndex) => {
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
      this.setState({ index: _index });
    };
    if (tp === 'blur') {
      // 失焦
    };
  }

  
}