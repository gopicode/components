import './JsonEdit.css';
import PropTypes from 'prop-types';

const TYPE_NULL = 'null';
const TYPE_ARRAY = 'array';
const TYPE_OBJECT = 'object';
const TYPE_BOOLEAN = 'boolean';
const TYPE_NUMBER = 'number';
const TYPE_STRING = 'string';

const MARKS = {
	"array": {beg: "[", end: "]"},
	"object": {beg: "{", end: "}"}
}

function getType(val) {
	if (val === null) return TYPE_NULL;
	if (Array.isArray(val)) return TYPE_ARRAY;
	return typeof(val);
}

function typecast(val) {
	val = val.trim()
	if (/^null$/i.test(val)) return null;
	if (/^true$/i.test(val)) return true;
	if (/^false$/i.test(val)) return false;
	if (/^\d+$/.test(val)) return Number(val);
	if (/^\d+\.\d+$/.test(val)) return Number(val);
	return String(val);
}

function joinPath(jpath, key) {
	return jpath ? [jpath, key].join('.') : key;
}

export class JsonEdit extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			value: props.value,
			action: '',
			jpath: '',
			jtype: ''
		};

		this.onCancel = this.onCancel.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onEdit = this.onEdit.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
	}

	onEdit(jpath) {
		console.log('onEdit', jpath)
		this.setState({action: 'edit', jpath})
	}

	onAdd(jpath, jtype) {
		console.log('onAdd', jpath, jtype)
		this.setState({action: ''})
		// this.setState({action: 'add', jpath, jtype})
	}

	onCreate(jpath, key, val) {
		console.log('onCreate', jpath, jtype)
		this.setState({action: 'create', jpath, jtype})
	}

	onUpdate(jpath, value) {
		let parts = jpath.split('.')
		let key = parts.pop()
		let newValue = {...this.state.value}
		let obj = newValue
		parts.forEach(part => {
			obj = obj[part]
		})
		obj[key] = typecast(value);
		console.log('onUpdate', jpath, value, parts, obj, key);
		this.setState({value: newValue, action: ''})
	}

	onDelete(jpath) {
		let parts = jpath.split('.')
		let key = parts.pop()
		let newValue = {...this.state.value}
		let obj = newValue
		parts.forEach(part => {
			obj = obj[part]
		})
		delete obj[key];
		console.log('onDelete', jpath, parts, obj, key)
		this.setState({value: newValue, action: ''})
	}

	onCancel(jpath) {
		console.log('onCancel', jpath)
		this.setState({action: ''})
	}

	draw(elem, opts = {}) {
		const keys = Object.keys(elem);
		const items = [];
		for (let i = 0; i < keys.length; i += 1) {
			const key = keys[i];
			const val = elem[key];
			const keyStr = opts.type === TYPE_ARRAY ? '' : `"${key}"`;
			const comma = (keys.length > 1 && i + 1 < keys.length);
			if (val !== null && typeof val === 'object') {
				const type = Array.isArray(val) ? TYPE_ARRAY : TYPE_OBJECT;
				const mark = MARKS[type];
				items.push(this.drawItem(keyStr, mark.beg, {index: i + '-beg'}));
				items.push(this.draw(val, {type, jpath: joinPath(opts.jpath, key)}));
				items.push(this.drawItem(null, mark.end,
					{type, jpath: opts.jpath, index: i + '-end', comma, deleteable: true, addable: true}
				));

			} else {
				const jpath = joinPath(opts.jpath, key)
				const editable = this.state.action === 'edit' && jpath === this.state.jpath
				items.push(this.drawItem(keyStr, val,
					{index: i, type: getType(val), jpath, comma, deleteable: true, editable}));
			}
		}
		return (
		<div className="json-object">
			{items}
		</div>
		)
	}

	drawItem(key, val, opts = {}) {
		const {comma, index, type, deleteable, addable, editable} = opts;
		const valStr = type === TYPE_STRING ? `"${val}"` : String(val);

		let valMarkup;
		if (editable) {
			valMarkup = (
			<span className="json-val">
				<input type="text" defaultValue={val} autoFocus={true}
					onKeyPress={e => e.key == "Enter" && this.onUpdate(opts.jpath, e.target.value)}/>
				}
				<button onClick={this.onCancel}>cancel</button>
			</span>
			)
		} else {
			valMarkup = (
			<span className="json-val-wrap">
				<span className="json-val" onClick={e => this.onEdit(opts.jpath)}>{valStr}{comma && ","}</span>
				{addable && <button className="json-btn-add" onClick={e => this.onAdd(opts.jpath, type)}>add</button>}
				{deleteable && <button className="json-btn-del" onClick={e => this.onDelete(opts.jpath)}>delete</button>}
			</span>
			)
		}

		return (
		<div key={index} className="json-line">
			{key && <span className="json-key">{key + ':'}</span>}
			{valMarkup}
			{/*path.length > 0 && <span>[{path.join('.')}]</span>*/}
		</div>
		)
	}

	render() {
		const val = this.state.value;
		const type = Array.isArray(val) ? TYPE_ARRAY : TYPE_OBJECT;
		const mark = MARKS[type];
		return (
		<div className={"json-edit"}>
			{this.drawItem(null, mark.beg, {index: '0-beg'})}
			{this.draw(val, {type, jpath:''})}
			{this.drawItem(null, mark.end, {type, index: '0-end'})}
		</div>
		)
	}
}

JsonEdit.propTypes = {
	value: PropTypes.object.isRequired,
	className: PropTypes.string,
	onChange: PropTypes.func // (value: String, id: props.id)
};

JsonEdit.defaultProps = {
	className: '',
	onChange: function(){}
};
