<div class="main">
  <div class="gfg">
    <p>GeeksForGeeks</p>
  </div>
  <div class="custom-wrapper">
    <div class="header">
      <h2 class="projtitle">Price Range Slider</h2>
    </div>

    <div class="price-input-container">
      <div class="price-input">
        <div class="price-field">
          <span>Minimum Price</span>
          <input type="number" class="min-input" value="2500" />
        </div>
        <div class="price-field">
          <span>Maximum Price</span>
          <input type="number" class="max-input" value="8500" />
        </div>
      </div>
      <div class="slider-container">
        <div class="price-slider"></div>
      </div>
    </div>

    <div class="range-input">
      <input
        type="range"
        class="min-range"
        min="0"
        max="10000"
        value="2500"
        step="1"
      />
      <input
        type="range"
        class="max-range"
        min="0"
        max="10000"
        value="8500"
        step="1"
      />
    </div>
  </div>
</div>;
