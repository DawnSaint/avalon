<template>
  <view class="lobby-header">
    <text>AVAL</text>
    <text class="lobby-header-on">ON</text>
    <text class="lobby-header-line">line</text>
  </view>
</template>

<style scoped lang="scss">
.lobby-header {
  font-family: 'Overt', sans-serif;
  font-size: $font-xxxl;
  font-weight: bold;
  color: $text-primary;
  text-align: center;
}

.lobby-header-on {
  color: $accent;
}

.lobby-header-line {
  color: $accent;
  font-size: $font-lg;
}
</style>
