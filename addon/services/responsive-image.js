import Ember from 'ember';

const { computed, A, assert } = Ember;

/**
 * Service class to provides images generated by the responsive images package
 *
 * @class ResponsiveImage
 * @extends Ember.Service
 * @namespace Services
 * @module responsive-image
 * @public
 */
export default Ember.Service.extend({

  /**
   * the screen's width
   * This is the base value to calculate the image size.
   * That means the {{#crossLink "Services/ResponsiveImage:getImageBySize"}}getImageBySize{{/crossLink}} will return
   * an image that's close to `screenWidth *  window.devicePixelRatio * size / 100`
   *
   * @property screenWidth
   * @type {Number}
   * @public
   */
  screenWidth: typeof screen !== 'undefined' ? screen.width : 320,

  /**
   * return the images with the different widths
   *
   * @method getImages
   * @param {String} imageName The origin name of the Image
   * @returns {Array} An array of objects with the image name and width, e.g. [{ width: 40, height: 20, image: myImage40w.jpg}, ...]
   * @public
   */
  getImages(imageName) {
    assert(`There is no data for image ${imageName}`, this.get('meta').hasOwnProperty(imageName));
    return A(this.get('meta')[imageName]);
  },

  /**
   * returns the image which fits for given size
   *
   * @method getImageBySize
   * @param {String} imageName The origin name of the Image
   * @param {Number} size The width of the image in percent of the screenwidth
   * @return {String} The url of the image
   * @public
   */
  getImageBySize(imageName, size) {
    return this.getImageDataBySize(imageName, size).image;
  },

  /**
   * returns the image data which fits for given size
   *
   * @method getImageBySize
   * @param {String} imageName The origin name of the Image
   * @param {Number} size The width of the image in percent of the screenwidth
   * @return {Object} The data with image,width and height
   * @public
   */
  getImageDataBySize(imageName, size) {
    let width = this.getDestinationImageWidthBySize(imageName, size);
    return this.getImages(imageName).findBy('width', width);
  },

  /**
   * returns the closest supported width to the screenwidth and size
   *
   * @method getDestinationImageWidthBySize
   * @param {String} image The name of the image
   * @param {Number} size The width of the image in percent of the screenwidth
   * @return {Number} the supported width
   * @private
   */
  getDestinationImageWidthBySize(image, size) {
    let destinationWidth = this.getDestinationWidthBySize(size || 100);
    return this.getSupportedWidths(image).reduce((prevValue, item)=> {
      if (item >= destinationWidth && prevValue >= destinationWidth) {
        return (item >= prevValue) ? prevValue : item;
      } else {
        return (item >= prevValue) ? item : prevValue;
      }
    }, 0);
  },

  /**
   * returns the supported widths of an image
   *
   * @method getSupportedWidths
   * @param {String} image the name of the image
   * @return {Number[]} the supported widths
   * @private
   */
  getSupportedWidths(image) {
    return this.getImages(image).map((item) => {
      return item.width;
    });
  },

  /**
   * @method getDestinationWidthBySize
   * @param {Number} size returns the physical width factored by size
   * @returns {Number}
   * @private
   */
  getDestinationWidthBySize(size)
  {
    let physicalWidth = this.get('physicalWidth');
    let factor = (size || 100) / 100;

    return physicalWidth * factor;
  },

  /**
   * the meta values from build time
   *
   * @property meta
   * @type {object}
   * @private
   */
  meta: {},

  /**
   * the physical width
   *
   * @property physicalWidth
   * @type {Number}
   * @readonly
   * @private
   */
  physicalWidth: computed('screenWidth', function() {
    return this.get('screenWidth') * (window && window.devicePixelRatio || 1);
  })
});
