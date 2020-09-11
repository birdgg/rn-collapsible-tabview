fixed header 方法：

在 flatlist 中监听 onScroll 事件，传递给动画参数 scrollY
给 header 和 tabbar 同时设置  transform: [{translateY: y}] 和 绝对定位来调整位置

scrollY 到 translateY 的映射为
```
    const y = scrollY.interpolate({
      inputRange: [0, HeaderHeight],
      outputRange: [HeaderHeight, 0],
      extrapolateRight: 'clamp',
    });
```

在当前 tab 滑动结束后， 需调用其他 tab 中 flatlist 的 scrollToOffset 方法调整位置。
```
 const syncScrollOffset = () => {
    const curRouteKey = routes[tabIndex].key;
    listRefArr.current.forEach(item => {
      if (item.key !== curRouteKey) {
        if (scrollY._value < HeaderHeight && scrollY._value >= 0) {
          if (item.value) {
            item.value.scrollToOffset({
              offset: scrollY._value,
              animated: false,
            });
            listOffset.current[item.key] = scrollY._value;
          }
        } else if (scrollY._value >= HeaderHeight) {
          if (
            listOffset.current[item.key] < HeaderHeight ||
            listOffset.current[item.key] == null
          ) {
            if (item.value) {
              item.value.scrollToOffset({
                offset: HeaderHeight,
                animated: false,
              });
              listOffset.current[item.key] = HeaderHeight;
            }
          }
        }
      }
    });
  };
  ```