import cds from '@sap/cds';
import rootHandlers from './index.js';

export default cds.service.impl( function () {
    rootHandlers(this);
});