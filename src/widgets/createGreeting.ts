import createGlobalized from './createGlobalized';
import { VNode } from 'maquette';

const createGreeting = createGlobalized
	.mixin({
		mixin: {
			getChildrenNodes(): VNode[] {
				return this.state.placeholder;
			}
		}
	})
	.extend({
		nlsPath: 'nls/main',
		nlsKeys: {
			hello: 'placeholder'
		}
	});

export default createGreeting;
