import jimp from 'jimp';
import path from 'path';
import moment from 'moment';
import wa from '@open-wa/wa-automate';

moment.locale('pt-br');

function getRandomImageLink() {
    return `https://picsum.photos/400/400?random=${Math.random()}`;
}

async function getImageDimension(image) {
    const imageWidth = await image.getWidth();
    const imageHeight = await image.getHeight();

    return {imageWidth, imageHeight};
}

async function getTextDimension({font, text}) {
    const textWidth = await jimp.measureText(font, text);
    const textHeight = await jimp.measureTextHeight(font, text, textWidth);

    return {textWidth, textHeight};
}

function getCentralPositionOfDimension({imageDimension, textDimension}) {
    return imageDimension / 2 - textDimension / 2; 
}

(async function() {

    const link = getRandomImageLink();
    const image = await jimp.read(link);
    const imageDimension = await getImageDimension(image);

    const font78 = await jimp.loadFont(path.resolve('src/fonts/font78.fnt'));
    const font78Dimension = await getTextDimension({ 
        font: font78,
         text: "BOM DIA"
    });
    const font28 = await jimp.loadFont(path.resolve('src/fonts/font28.fnt'));
    const font28Dimension = await getTextDimension({ 
        font: font28, 
        text: "Que você tenha uma ótima"
    });
    
    let imageWithText = await image.print(
        font78,
        getCentralPositionOfDimension(
            {
                imageDimension: imageDimension.imageWidth,
                textDimension: font78Dimension.textWidth}),
        0,
        "BOM DIA"
    );

    imageWithText = await imageWithText.print(
        font28,
        getCentralPositionOfDimension(
            {
                imageDimension: imageDimension.imageWidth,
                textDimension: font28Dimension.textWidth}),
        imageDimension.imageHeight - font28Dimension.textHeight - 60,
        "Que você tenha uma ótima"
    );

    imageWithText = await imageWithText.print(
        font28,
        getCentralPositionOfDimension(
            {
                imageDimension: imageDimension.imageWidth,
                textDimension: font28Dimension.textWidth}),
        imageDimension.imageHeight - font28Dimension.textHeight + 20,
        moment().format('dddd').toUpperCase()
    );
    
    const base64Image = await imageWithText.getBase64Async(jimp.MIME_JPEG);
    
    const whatsappClient = await wa.create();

    const groups = await whatsappClient.getAllGroups();

    const familyGroups = await groups.filter( group => group.formattedTitle.indexOf('Família') !== -1);

    for (let index = 0; index < familyGroups.length; index++) {
        await whatsappClient.sendFile(familyGroups[index].id._serialized, base64Image, 'bomdia.jpg', 'ENVIADO DO BOT DO SALMO');
        
    }
})()

