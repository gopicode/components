// import {h} from './h.js'
import './ComboBox.css';

export class ComboBox extends React.PureComponent {
	constructor(props) {
		super(props);
		this.onInputFocus = this.onInputFocus.bind(this);
		this.onInputBlur = this.onInputBlur.bind(this);
		this.onInputKeyDown = this.onInputKeyDown.bind(this);
		this.onSelectBlur = this.onSelectBlur.bind(this);
		this.onSelectKeyDown = this.onSelectKeyDown.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
	}

	onInputFocus(e) {
		e.currentTarget.select();
	}

	onInputBlur(e) {
		// console.log('eeeee input blur', e.relatedTarget, this.$select, (this.$select && this.$select.contains(e.relatedTarget)));
		if (this.$select && this.$select.contains(e.relatedTarget)) return;
	}

	onInputKeyDown({nativeEvent:e}) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const args = {key: e.key, keyCode: e.keyCode};
			const evt = new KeyboardEvent(e.type, args);
			if (this.$select) {
				this.$select.focus();
				this.$select.dispatchEvent(evt);
			}
		}
	}

	onSelectBlur(e) {
		// console.log('eeeee select blur', e.relatedTarget, this.$input, (this.$input && this.$input === e.relatedTarget));
		if (this.$input && this.$input === e.relatedTarget) return;
	}

	onSelectKeyDown(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const idx = +e.currentTarget.value;
		}
	}

	onItemClick() {
	}

	render() {
		const { items } = this.props
		return (
		<span className="zPu-suggest">
			<input ref={el => this.$input = el} className="zPu-suggest-input" autoComplete="off"
				value={queryInput}
				onFocus={this.onInputFocus}
				onBlur={this.onInputBlur}
				onKeyDown={this.onInputKeyDown}
			/>
			<br/>
			<span className="zPu-suggest-list">
				<select ref={el => this.$select = el} multiple="true" size="5"
					className="zPu-suggest-select"
					onBlur={this.onSelectBlur}
					onKeyDown={this.onSelectKeyDown}>
				{items.map((item, k) =>
					<option key={k} value={k} onClick={this.onItemClick}>
					{item.name} ({item.count})
					</option>
				)}
				</select>
			</span>
		</span>
		)
	}
}
