import './JsonEdit2.less';
import PropTypes from 'prop-types';

const TYPE_NULL = 'null';
const TYPE_ARRAY = 'array';
const TYPE_OBJECT = 'object';
const TYPE_BOOLEAN = 'boolean';
const TYPE_NUMBER = 'number';
const TYPE_STRING = 'string';
const TYPE_MARKER = '__mark';

const MARKS = {
	"colon": ":",
	"comma": ",",
	"quote": '"',
	"array": {beg: "[", end: "]"},
	"object": {beg: "{", end: "}"}
}
const MARKS_LIST = [MARKS.array.beg, MARKS.array.end, MARKS.object.beg, MARKS.object.end];

function getType(val) {
	if (val === null) return TYPE_NULL;
	if (Array.isArray(val)) return TYPE_ARRAY;
	if (MARKS_LIST.includes(val)) return TYPE_MARKER;
	return typeof(val);
}

function typecast(val) {
	val = val.trim()
	if (/^null$/i.test(val)) return null;
	if (/^true$/i.test(val)) return true;
	if (/^false$/i.test(val)) return false;
	if (/^\d+$/.test(val)) return Number(val);
	if (/^\d+\.\d+$/.test(val)) return Number(val);
	if (/^\{\}$/i.test(val)) return {};
	if (/^\[\]$/i.test(val)) return [];
	return String(val);
}

function editLine(e) {
	const $el = e.currentTarget;
	const $line = $el.closest('.json-line');
	$line.classList.add('edit');
	const $form = $el.closest('form');
	$form.elements[0].focus();
}

function resetLine(e) {
	const $el = e.currentTarget;
	const $line = $el.closest('.json-line');
	$line.classList.remove('edit');
}

function onKeyInput(e) {
	// console.log('key', e.key);
	if (e.key == "Escape") resetLine(e);
}


class JsonLine extends React.PureComponent {
	constructor(props) {
		super(props);
		this.update = this.update.bind(this);
		this.remove = this.remove.bind(this);
	}

	update(e) {
		e.preventDefault();
		const $form = e.currentTarget;
		const $line = $form.closest('.json-line');
		$line.classList.remove('edit');

		const $inputValue = $form.elements.value;
		const newValue = typecast($inputValue.value.trim());

		// const $inputName = $form.elements.name;
		// const newName = $inputName ? $inputName.value.trim() : '';

		const {name, index} = this.props;
		const trace = ['update'];
		this.props.update(name || index, newValue, trace);
	}

	remove(e) {
		e.preventDefault();
		const {name, index} = this.props;
		const trace = ['remove'];
		this.props.remove(name || index, trace);
	}

	render() {
		const {name, val, comma, isNull, update, remove} = this.props;
		const quote = getType(val) === TYPE_STRING ? MARKS.quote : '';
		return (
			<div className="json-line">
				<form onSubmit={this.update} onKeyDown={onKeyInput}>
					{name && <span>
						<span className="json-name" onClick={editLine}>{name}</span>
						{/*<input className="txt" type="text" name="name" defaultValue={name} />*/}
						{MARKS.colon}
					</span>}
					<span className="json-val" onClick={editLine}>{isNull ? "null" : (quote + val + quote)}</span>
					<input className="txt" type="text" name="value" defaultValue={val} autoFocus={true} />
					{comma && <span className="json-comma">{MARKS.comma}</span>}
					{update && <button className="btn btn-update" type="submit">update</button>}
					{remove && <button className="btn btn-remove" onClick={this.remove}>remove</button>}
					<button className="btn btn-cancel" onClick={resetLine}>cancel</button>
				</form>
			</div>
		)
	}
}

class JsonObject extends React.PureComponent {
	constructor(props) {
		super(props);
		this.update = this.update.bind(this);
		this.remove = this.remove.bind(this);
	}

	update(k, v, trace = []) {
		// console.log('update JsonObject', k, v);
		trace.push(k);
		const {name, index, val:obj, update: pUpdate} = this.props;
		const newValue = {...obj};
		newValue[k] = v;
		pUpdate(name || index, newValue, trace);
	}

	remove(k, trace = []) {
		// console.log('remove JsonObject', k);
		trace.push(k);
		const {name, index, val:obj, update: pUpdate} = this.props;
		const newValue = {...obj};
		delete newValue[k];
		pUpdate(name || index, newValue, trace);
	}

	render() {
		const {name, index, val:obj, remove: pRemove, comma} = this.props;
		const keys = Object.keys(obj);
		const kids = keys.map((k, i) => {
			const v = obj[k];
			const type = getType(v);
			const comma = (i < keys.length - 1);
			if (type === TYPE_ARRAY)
				return <JsonArray key={i} name={k} val={v} comma={comma} update={this.update} remove={this.remove} />;
			else if (type === TYPE_OBJECT)
				return <JsonObject key={i} name={k} val={v} comma={comma} update={this.update} remove={this.remove} />;
			else
				return <JsonLine key={i} name={k} val={v} comma={comma}
					isNull={v === null} update={this.update} remove={this.remove} />;
		});
		return (
			<div className="json-object">
				<JsonLine name={name} index={index} val={MARKS.object.beg} remove={pRemove} />
				<div className="json-kids">{kids}</div>
				<JsonLine val={MARKS.object.end} comma={comma} />
			</div>
		)
	}
}

class JsonArray extends React.PureComponent {
	constructor(props) {
		super(props);
		this.update = this.update.bind(this);
		this.remove = this.remove.bind(this);
	}

	update(k, v, trace = []) {
		// console.log('update JsonArray', k, v);
		trace.push(k);
		const {name, index, val:arr, update: pUpdate} = this.props;
		const newValue = [...arr];
		newValue[k] = v;
		pUpdate(name || index, newValue, trace);
	}

	remove(k, trace = []) {
		console.log('remove JsonArray', k);
		trace.push(k);
		const {name, index, val:arr, update: pUpdate} = this.props;
		const newValue = [...arr];
		newValue.splice(k, 1);
		pUpdate(name || index, newValue, trace);
	}

	render() {
		const {name, index, val:arr, remove: pRemove, comma} = this.props;
		const kids = arr.map((v, i) => {
			const type = getType(v);
			const comma = (i < arr.length - 1);
			if (type === TYPE_ARRAY)
				return <JsonArray key={i} index={i} val={v} comma={comma} update={this.update} remove={this.remove} />;
			else if (type === TYPE_OBJECT)
				return <JsonObject key={i} index={i} val={v} comma={comma} update={this.update} remove={this.remove} />;
			else
				return <JsonLine key={i} index={i} val={v} comma={comma}
					isNull={v === null} update={this.update} remove={this.remove} />;
		});
		return (
			<div className="json-array">
				<JsonLine name={name} index={index} val={MARKS.array.beg} remove={pRemove} />
				<div className="json-kids">{kids}</div>
				<JsonLine val={MARKS.array.end} comma={comma}/>
			</div>
		)
	}
}

const sample = {
	a: 12,
	b: {
		c: 32,
		g: {
			t: 55,
			m: [10, 20]
		},
		h: ["some", "thing", {p: true, q: false}],
		m: 15
	},
	d: "ok"
};
export class JsonEdit extends React.PureComponent {
	constructor(props) {
		super(props);

		// clone the json value
		// const value = props.value;
		// const valueClone = JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));

		this.state = {
			// value: valueClone,
			value:sample,
			action: ''
		};

		this.update = this.update.bind(this);
	}

	update(k, v, trace) {
		console.log(trace, v);
		const newValue = v;
		this.setState({value: newValue});
	}

	render() {
		return (
		<div className={"json-edit"}>
			<div>
				<JsonObject val={this.state.value} update={this.update} />
			</div>
			<div>
				<button type="button" onClick={e => this.props.onChange(this.state.value)}>Save</button>
			</div>
		</div>
		)
	}
}

JsonEdit.propTypes = {
	value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
	className: PropTypes.string,
	onChange: PropTypes.func // (value: String, id: props.id)
};

JsonEdit.defaultProps = {
	className: '',
	onChange: function(){}
};
