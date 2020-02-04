import './JsonEditRecur.less';
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


class JsonLine extends React.PureComponent {
	constructor(props) {
		super(props);
		this.reset = this.reset.bind(this);
		this.add = this.add.bind(this);
		this.edit = this.edit.bind(this);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.remove = this.remove.bind(this);
		this.onKeyInput = this.onKeyInput.bind(this);
	}

	onKeyInput(e) {
		// console.log('key', e.key);
		if (e.key == "Escape") this.reset(e);
	}

	reset(e, $line) {
		if (!$line) {
			$line = e.currentTarget.closest('.json-line');
		}
		const $struct = $line.closest('.json-struct');
		const $item = $line.querySelector('.json-item');
		const forms = Array.from($line.querySelectorAll('.frm'));
		$struct.classList.remove('wip');
		$item.classList.remove('hide');
		forms.forEach($form => $form.classList.add('hide'));
	}

	add(e) {
		const $el = e.currentTarget;
		const $line = $el.closest('.json-line');
		const $struct = $line.closest('.json-struct');
		const $form = $line.querySelector('.frm-create');
		$struct.classList.add('wip');
		$form.classList.remove('hide');
		$form.elements[0].focus();
	}

	edit(e) {
		const $el = e.currentTarget;
		const $line = $el.closest('.json-line');
		const $struct = $line.closest('.json-struct');
		const $item = $line.querySelector('.json-item');
		const $form = $line.querySelector('.frm-update');
		$struct.classList.add('wip');
		$item.classList.add('hide');
		$form.classList.remove('hide');
		$form.elements[0].focus();
	}

	create(e) {
		e.preventDefault();
		const $form = e.currentTarget;
		const $line = $form.closest('.json-line');
		this.reset(null, $line);

		const $inputValue = $form.elements.value;
		const newValue = typecast($inputValue.value.trim());

		const $inputName = $form.elements.name;
		const newName = $inputName ? $inputName.value.trim() : null;

		const trace = ['create', newValue];
		this.props.create(newName, newValue, trace);
	}

	update(e) {
		e.preventDefault();
		const $form = e.currentTarget;
		const $line = $form.closest('.json-line');
		this.reset(null, $line);

		const $inputValue = $form.elements.value;
		const newValue = $inputValue ? typecast($inputValue.value.trim()) : null;

		const $inputName = $form.elements.name;
		const newName = $inputName ? $inputName.value.trim() : null;

		const {name, index} = this.props;
		const trace = ['update', newValue];
		this.props.update(newName || index, newValue, name || index, trace);
	}

	remove(e) {
		e.preventDefault();
		const {name, index} = this.props;
		const trace = ['remove'];
		this.props.remove(name || index, trace);
	}

	render() {
		const {name, val, comma, isNull, ctype, create, update, remove} = this.props;
		const quote = getType(val) === TYPE_STRING ? MARKS.quote : '';
		return (
			<div className="json-line">
				{create && <form className="frm frm-create hide" onSubmit={this.create} onKeyDown={this.onKeyInput}>
					{ctype == TYPE_OBJECT && <input className="txt" type="text" name="name" />}
					<input className="txt" type="text" name="value" />
					<button className="btn btn-create" type="submit">create</button>
					<button className="btn btn-cancel" type="button" onClick={this.reset}>cancel</button>
				</form>}
				<div className="json-item">
					{name && <span>
						<span className="json-name" onClick={this.edit}>{name}</span>
						{MARKS.colon}
					</span>}
					<span className="json-val" onClick={this.edit}>{isNull ? "null" : (quote + val + quote)}</span>
					{remove && <button className="btn btn-hover btn-del" onClick={this.remove}>remove</button>}
					{create && <button className="btn btn-hover btn-add" onClick={this.add}>add</button>}
				</div>
				{update && <form className="frm frm-update hide" onSubmit={this.update} onKeyDown={this.onKeyInput}>
					{name && <span>
						<input className="txt" type="text" name="name" defaultValue={name} />
						{MARKS.colon}
					</span>}
					<input className="txt" type="text" name="value" defaultValue={val} />
					{comma && <span className="json-comma">{MARKS.comma}</span>}
					<button className="btn btn-update" type="submit">update</button>
					<button className="btn btn-cancel" type="button" onClick={this.reset}>cancel</button>
				</form>}
			</div>
		)
	}
}

class JsonObject extends React.PureComponent {
	constructor(props) {
		super(props);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.updateKey = this.updateKey.bind(this);
		this.remove = this.remove.bind(this);
	}

	create(k, v, trace = []) {
		// console.log('update JsonObject', k, v);
		trace.push(k);
		const {name, index, val:obj, update: pUpdate} = this.props;
		const newValue = {...obj};
		newValue[k] = v;
		pUpdate(name || index, newValue, null, trace);
	}

	update(k, v, p, trace = []) {
		console.log('update JsonObject', k, v, p);
		trace.push(k);
		const {name, index, val:obj, update: pUpdate} = this.props;
		const newValue = {...obj};
		newValue[k] = v;
		// if the key changed, remove it from the clone
		if (p && p != k) {
			delete newValue[p]
		}
		pUpdate(name || index, newValue, null, trace);
	}

	updateKey(k, v, p, trace = []) {
		console.log('updateKey JsonObject', k, v, p);
		trace.push(k);
		const {name, index, val, update: pUpdate} = this.props;
		pUpdate(k, val, name || index, trace);
	}

	remove(k, trace = []) {
		// console.log('remove JsonObject', k);
		trace.push(k);
		const {name, index, val:obj, update: pUpdate} = this.props;
		const newValue = {...obj};
		delete newValue[k];
		pUpdate(name || index, newValue, null, trace);
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
			<div className="json-struct object">
				<JsonLine name={name} index={index} val={MARKS.object.beg} update={this.updateKey} remove={pRemove} />
				<div className="json-kids">{kids}</div>
				<JsonLine val={MARKS.object.end} comma={comma} create={this.create} ctype={TYPE_OBJECT} />
			</div>
		)
	}
}

class JsonArray extends React.PureComponent {
	constructor(props) {
		super(props);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.updateKey = this.updateKey.bind(this);
		this.remove = this.remove.bind(this);
	}

	create(k, v, trace = []) {
		// console.log('update JsonArray', k, v);
		trace.push(k);
		const {name, index, val:arr, update: pUpdate} = this.props;
		const newValue = [...arr];
		newValue.push(v);
		pUpdate(name || index, newValue, null, trace);
	}

	update(k, v, p, trace = []) {
		console.log('update JsonArray', k, v, p);
		trace.push(k);
		const {name, index, val:arr, update: pUpdate} = this.props;
		const newValue = [...arr];
		newValue[k] = v;
		pUpdate(name || index, newValue, null, trace);
	}

	updateKey(k, v, p, trace = []) {
		console.log('updateKey JsonArray', k, v, p);
		trace.push(k);
		const {name, index, val, update: pUpdate} = this.props;
		pUpdate(k, val, name || index, trace);
	}

	remove(k, trace = []) {
		console.log('remove JsonArray', k);
		trace.push(k);
		const {name, index, val:arr, update: pUpdate} = this.props;
		const newValue = [...arr];
		newValue.splice(k, 1);
		pUpdate(name || index, newValue, null, trace);
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
			<div className="json-struct array">
				<JsonLine name={name} index={index} val={MARKS.array.beg} update={this.updateKey} remove={pRemove} />
				<div className="json-kids">{kids}</div>
				<JsonLine val={MARKS.array.end} comma={comma} create={this.create} ctype={TYPE_ARRAY} />
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

	update(k, v, p, trace) {
		console.log(trace);
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
