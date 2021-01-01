const { cv } = require('opencv-wasm')
const Jimp = require('jimp')
const pixelmatch = require('pixelmatch')

async function build(img){
	
    var background = new Jimp(260, 160)
    var oof = ['157', '145', '265', '277', '181', '169', '241', '253', '109', '97', '289', '301', '85', '73', '25', '37', '13', '1', '121', '133', '61', '49', '217', '229', '205', '193']
    var poof = ['145', '157', '277', '265', '169', '181', '253', '241', '97', '109', '301', '289', '73', '85', '37', '25', '1', '13', '133', '121', '49', '61', '229', '217', '193', '205']

    for (i = 0; i < 26; i++){
		
		var img2 = img.clone();
		
        img2.crop(parseInt(oof[i]), 80, 10, 80)

        background.composite(img2, i*10, 0)
	}

    for (i = 0; i < 26; i++){
		var img2 = img.clone();
		
        img2.crop(parseInt(poof[i]), 0, 10, 80)
        background.composite(img2, i*10, 80)
	}
	
	return background;
}


async function findDiffPosition (bg, fullbg) {
    const originalImage = await build(await Jimp.read("https://static.geetest.com/"+bg))
    const captchaImage = await build(await Jimp.read("https://static.geetest.com/"+fullbg))

	

    const { width, height } = originalImage.bitmap
    const diffImage = new Jimp(width, height)

    const diffOptions = { includeAA: true, threshold: 0.2 }

    pixelmatch(originalImage.bitmap.data, captchaImage.bitmap.data, diffImage.bitmap.data, width, height, diffOptions)


    let srcImage = diffImage;
    let src = cv.matFromImageData(srcImage.bitmap)
	
	
    let dst = new cv.Mat()
    let kernel = cv.Mat.ones(5, 5, cv.CV_8UC1)
    let anchor = new cv.Point(-1, -1)

    cv.threshold(src, dst, 127, 255, cv.THRESH_BINARY)
    cv.erode(dst, dst, kernel, anchor, 1)
    cv.dilate(dst, dst, kernel, anchor, 1)
    cv.erode(dst, dst, kernel, anchor, 1)
    cv.dilate(dst, dst, kernel, anchor, 1)

    cv.cvtColor(dst, dst, cv.COLOR_BGR2GRAY)
    cv.threshold(dst, dst, 150, 255, cv.THRESH_BINARY_INV)

    let contours = new cv.MatVector()
    let hierarchy = new cv.Mat()
    cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    let contour = contours.get(0)
    let moment = cv.moments(contour)
	
	
    return [Math.floor(moment.m10 / moment.m00), Math.floor(moment.m01 / moment.m00)]
	
}





async function getDistance(bg, fullbg){
	let [cx, cy] = await findDiffPosition(bg, fullbg)
	
	return cx-25;
}

module.exports = {getDistance};