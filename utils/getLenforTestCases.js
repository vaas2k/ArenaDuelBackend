import fs from 'fs';
import path from 'path'

export default function getTotalTestCases(problem_id) {
    const extractedFolderPath = `./tests/${problem_id}`;
    let totalCases = 0;

    fs.readdirSync(extractedFolderPath).forEach(file => {
        const filePath = path.join(extractedFolderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);

            // Only count when both .in and .out files exist for the same base name
            if (ext === '.in' && fs.existsSync(path.join(extractedFolderPath, `${baseName}.out`))) {
                totalCases++;
            }
        }
    });

    return totalCases;
}