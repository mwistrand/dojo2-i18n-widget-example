import createGlobalized from './createGlobalized';
import { VNode } from 'maquette';

const createOrderedList = createGlobalized
	.mixin({
		mixin: {
			getChildrenNodes(): (VNode | string)[] {
				const messages: { [key: string]: string } = this.state.messages;
				if (!messages) {
					return [] as VNode[];
				}
				return Object.keys(messages).map(function (key: string): string {
					return messages[key];
				});
			}
		}
	})
	.extend({
		nlsPath: 'nls/numbers',
		nlsKeys: [ 'one', 'two', 'three' ],
		tagName: 'ol'
	});

export default createOrderedList;
