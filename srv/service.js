import cds from '@sap/cds';
import rootHandlers from './index.js';

export default cds.service.impl(async function () {
    rootHandlers(this);
});