import del from 'del';
import mkdir from 'fs-util';

//clean up transpile and ensure build dirctory is solid
async function clean() {
    await del(['.tmp', 'build/*', '!build/.git'], { dot: true });
    await mkdir('build/public');
}

export default clean;