'use strict';

const vision = require('@google-cloud/vision');
var express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var emoji = require('node-emoji')

const client = new vision.ImageAnnotatorClient();
var upload = multer({ dest: 'uploads/' });
const app = express();

const joyWords = [
  'sunny',
  'comet',
  'airplane',
  'sparkles',
  'eight_spoked_asterisk',
  'exclamation',
  'heavy_exclamation_mark',
  'heavy_heart_exclamation_mark_ornament',
  'heart',
  'peace_symbol',
  'relaxed',
  'v',
  'sunrise',
  'rainbow',
  'sun_with_face',
  'cherry_blossom',
  'rose',
  'sunflower',
  'blossom',
  'fallen_leaf',
  'fireworks',
  'sparkler',
  'open_hands',
  'joy',
  'grin',
  'grinning',
  'laughing',
  'satsfied',
  'smile',
  'smiley',
  'joy_cat'
];

const confidenceWords = [
  '100',
  'arrow_heading_up',
  'point_up',
  'fist',
  'hand',
  'raised_hand',
  'star',
  'sun_with_face',
  'star2',
  'stars',
  'maple_leaf',
  'ok_hand',
  '1',
  'thumbsup',
  'clap',
  'round_pushpin',
  'pushpin',
  'fire',
  'dark_sunglasses',
  'sunglasses',
  'stuck_out_tongue_winking_eye'
];

const sorrowWords = [
  'skull_and_crossbones',
  'white_frowning_face',
  'coffin',
  'first_quarter_moon_with_face',
  'point_down',
  'thumbsdown',
  'skull',
  'broken_heart',
  'blue_heart',
  'green_heart',
  'purple_heart',
  'shit',
  'poop',
  'knife',
  'pensive',
  'sweat',
  'disappointed',
  'cry',
  'frowning',
  'tired_face',
  'sleepy',
  'grimacing',
  'sob',
  'cold_sweat',
  'face_with_head_bandage'
];

const angerWords = [
  'crossed_swords',
  'scissors',
  'heavy_minus_sign',
  'negative_squared_cross_mark',
  'lightning_cloud',
  'tornado',
  'rat',
  'snake',
  'eyes',
  'point_down',
  'punch',
  'facepunch',
  'broken_heart',
  'anger',
  'poop',
  'shit',
  'knife',
  'gun',
  'middle_finger',
  'right_anger_bubble',
  'unamused',
  'rage',
  'face_with_rolling_eyes',
  'no_good',
  'toilet'
];

const surpriseWords = [
  'exclamation',
  'heavy_exclamation_mark',
  'heavy_heart_exclamation_mark_ornament',
  'bangbang',
  'warning',
  'zap',
  'eyes',
  'clap',
  'bomb',
  'boom',
  'collision'
];

const joyQuotes = [
  'Don\'t cry because it\'s over, smile because it happened.',
  'The most wasted of all days is one without laughter.',
  'Live more worry less',
  'Enjoy it all',
  'Stay smiling!',
  'Focus on the good',
  'Just let it be',
  'Happiness can be found, even in the darkest of times if only one remembers to turn on the light.',
  'What feels like the end is often the beginning.',
  'Always believe that something wonderful is about to happen.'
];

const confidenceQuotes = [
  'I am who I am, I am what I am, I do what I do and I ain’t never gonna do it any different. I don’t care who likes it and who doesn’t.',
  'Do not take life too seriously. You will never get out of it alive'
];

const sorrowQuotes = [
  'I guess broken pieces of glass hurt one badly and so does broken pieces of human heart.',
  'Whenever I feel that things are going the right direction, they take a U-turn.'
];

const angerQuotes = [
  'I hate the world'
];

const surpriseQuotes = [
  'Wow!'
];

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/Legend'));

app.post('/home', upload.array(), (req, res) => {
  var txt = req.body.link;
  console.log(txt);

  const request = {
    image: {
      source: { imageUri: txt }
    }
  };

  client
    .faceDetection(request)
    .then((response) => {
      console.log(response);
      if (response[0].error == null) {
        var faceInfo = response[0].faceAnnotations[0];
        var detCon = faceInfo.detectionConfidence;
        var lanCon = faceInfo.landmarkingConfidence;
        var joy = faceInfo.joyLikelihood;
        var sorrow = faceInfo.sorrowLikelihood;
        var anger = faceInfo.angerLikelihood;
        var surprise = faceInfo.surpriseLikelihood;
        // console.log(faceInfo);
        // console.log(detCon);
        // console.log(lanCon);
        console.log(joy);
        console.log(sorrow);
        console.log(anger);
        console.log(surprise);
        var avCon = (detCon + lanCon) / 2;
        console.log(avCon);

        var posEmotions = ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'];
        var emotions = [
          [joy, joyWords, joyQuotes],
          [sorrow, sorrowWords, sorrowQuotes],
          [anger, angerWords, angerQuotes],
          [surprise, surpriseWords, surpriseQuotes]
        ];

        // String of emojis that relate to the 
        var emojis = '';
        var quotes = '';

        if (avCon > 0.5) {
          for (var i = 0; i < 3; i++) {
            var e1 = confidenceWords[Math.floor(Math.random() * confidenceWords.length)];
            emojis += (',' + emoji.get(e1));
            var q1 = confidenceQuotes[Math.floor(Math.random() * confidenceQuotes.length)];
            quotes += (',' + q1);
          }
        }
        emotions.forEach((tup) => {
          if (posEmotions.indexOf(tup[0]) > -1) {
            for (var i = 0; i < 3; i++) {
              var e1 = tup[1][Math.floor(Math.random() * tup[1].length)];
              emojis += (',' + emoji.get(e1));
              var q1 = tup[2][Math.floor(Math.random() * tup[2].length)];
              quotes += (',' + q1);
            }
          }
        });
        if (emojis.length == 0) {
          res.send(' I don\'t know what to caption this lol' + emoji.get('smile'));
        }
        quotes = quotes.substring(1);
        emojis = emojis.substring(1);
        console.log(emojis);
        res.send(emojis + ',' + quotes);
      } else {
        console.log('Error');
        res.send('Error: Enter a valid URL.');
      } 
    })
    .catch((err) => {
      console.error(err);
    });
});

// app.post('/upload', upload.single('image'), (req, res, next) => {

//   const request = {
//     image: {
//       source: { imageUri: req.file.path }
//     }
//   };

//   client
//     .faceDetection(request)
//     .then((response) => {
//       console.log(response);
//       console.log(response[0].faceAnnotations);
//       res.send('hi');
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Legend/index.html');
});

app.listen(3000, () => {
  console.log('Example app listening on http://localhost:3000');
})