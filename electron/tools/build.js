import clean from './clean';
import run from './run';

async function build() {
    await run(clean);
}

export default build;