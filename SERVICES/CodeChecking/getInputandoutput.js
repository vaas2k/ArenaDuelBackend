import fs from 'fs';
import path from 'path';


// Function to read content from the extracted folder
export default async function getInputandOutputfromFolder(extractedFolderPath) {

    let data = [] ;
    fs.readdirSync(extractedFolderPath).forEach(file => {
        const filePath = path.join(extractedFolderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const content = fs.readFileSync(filePath, 'utf-8');

            if (ext === '.in') {
                if (!data[baseName]) data[baseName] = {};
                data[baseName].input = content;
            } else if (ext === '.out') {
                if (!data[baseName]) data[baseName] = {};
                data[baseName].output = content;
            }
        }
    });
    
    return data; 
};