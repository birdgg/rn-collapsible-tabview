/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, Animated} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
const {width} = Dimensions.get('window').width;

const TabBarHeight = 48;
const HeaderHeight = 300;

const List = ({
  scrollY,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScrollEndDrag,
  onGetRef,
}) => {
  const data = new Array(20).fill(1);
  const renderItem = ({item, index}) => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width,
          height: 100,
        }}>
        <Text>{index}</Text>
      </View>
    );
  };
  return (
    <Animated.FlatList
      ref={onGetRef}
      data={data}
      renderItem={renderItem}
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: true,
      })}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      contentContainerStyle={{
        paddingTop: HeaderHeight + TabBarHeight,
        paddingHorizontal: 10,
      }}
    />
  );
};

const initialLayout = {width};

function App() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRefArr = useRef([]);
  const listOffset = useRef({});
  const isListGliding = useRef(false);

  const [tabIndex, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'First'},
    {key: 'second', title: 'Second'},
  ]);

  useEffect(() => {
    scrollY.addListener(({value}) => {
      const curRoute = routes[tabIndex].key;
      listOffset.current[curRoute] = value;
    });

    return () => {
      scrollY.removeAllListeners();
    };
  }, [routes, tabIndex]);

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

  const onMomentumScrollBegin = () => {
    isListGliding.current = true;
  };

  const onMomentumScrollEnd = () => {
    isListGliding.current = false;
    syncScrollOffset();
  };

  const onScrollEndDrag = () => {
    syncScrollOffset();
  };

  const renderTabBar = props => {
    const y = scrollY.interpolate({
      inputRange: [0, HeaderHeight],
      outputRange: [HeaderHeight, 0],
      extrapolateRight: 'clamp',
    });
    return (
      <Animated.View
        style={{
          top: 0,
          zIndex: 1,
          position: 'absolute',
          transform: [{translateY: y}],
          height: TabBarHeight,
          width: '100%',
        }}>
        <TabBar {...props} style={styles.tab} />
      </Animated.View>
    );
  };

  const renderScene = ({route}) => {
    return (
      <List
        scrollY={scrollY}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onGetRef={ref => {
          if (ref) {
            const found = listRefArr.current.find(e => e.key === route.key);
            if (!found) {
              listRefArr.current.push({
                key: route.key,
                value: ref.getNode(),
              });
            }
          }
        }}
      />
    );
  };

  const renderHeader = () => {
    const y = scrollY.interpolate({
      inputRange: [0, HeaderHeight],
      outputRange: [0, -HeaderHeight],
      extrapolateRight: 'clamp',
    });
    return (
      <Animated.View style={[styles.header, {transform: [{translateY: y}]}]}>
        <Text>{'Header'}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={{flex: 1, marginTop: 30}}>
      <TabView
        navigationState={{index: tabIndex, routes}}
        renderTabBar={renderTabBar}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
      />
      {renderHeader()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    top: 0,
    height: HeaderHeight,
    width: '100%',
    backgroundColor: '#40C4FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});

export default App;
