import {h} from './h.js'
import './Button.css';

export class Button extends React.Component {
	render() {
		const {children, ...props} = this.props;
		props.className = 'btn';
		return h('button', props, children);
	}
}
