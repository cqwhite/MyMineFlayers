const cannyEdgeDetector = require('canny-edge-detector');
const Image = require('image-js').Image;

Image.load('puppy.png').then((img) => {
  const grey = img.grey();
  const edge = cannyEdgeDetector(grey);
  return edge.save('edge.png');
})

//We installed canny-edge-detecter and image-js with node install
//image file must be named the same as the load function
//will be saved as edge.png