


export const resolveB = (tx, outNum = null, pushData = null) => {
	let startPrefixIndex = 2; // Start at index based on whether it is an OP_RETURN OP_FALSE OR NOT
	var Bscript = null;
	if (outNum) {
		if (!tx.outputs[outNum] || !tx.outputs[outNum].script.isSafeDataOut()) {
			return null;
		}
		Bscript = tx.outputs[outNum].script;
		if (
			(pushData || pushData === 0) &&
			tx.outputs[outNum].script &&
			tx.outputs[outNum].script.chunks &&
			tx.outputs[outNum].script.chunks[pushData]
		) {
			return {
				media_type: 'text/plain',
				encoding: 'utf8',
				filename: '',
			};
		}
	} else {
		Bscript = tx.outputs.filter((output) => {
			return output.script.isSafeDataOut();
		});
		startPrefixIndex = 2;

		if (!Bscript.length) {
			// Try to get the non safe data out
			Bscript = tx.outputs.filter((output) => {
				return output.script.isDataOut();
			});
			startPrefixIndex = 1;
		}

		if (Bscript.length) {
			Bscript = Bscript[0].script;
		}
	}

	if (!(Bscript.chunks[startPrefixIndex].buf.toString() == '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut')) {
		// Not B transaction
		return null;
	}
	return {
		media_type: Bscript.chunks[startPrefixIndex + 2]
			? Bscript.chunks[startPrefixIndex + 2].buf.toString()
			: 'text/plain',
		encoding: Bscript.chunks[startPrefixIndex + 3]
			? Bscript.chunks[startPrefixIndex + 3].buf.toString()
			: '',
		filename: Bscript.chunks[startPrefixIndex + 4]
			? Bscript.chunks[startPrefixIndex + 4].buf.toString()
			: '',
	};
};
