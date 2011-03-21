function addJob(queue,job)
{
	if (!job)
		return;
	var cmd = {};
	cmd.job = job;
	if (arguments.length > 2)
	{
		cmd.args = Array.prototype.slice.call(arguments,2);
	}
	queue.push(cmd);
	return cmd;
}

function runWorkQueue(queue,internal)
{
	if (!internal && queue.active) // can't let new jobs get ahead of old ones
	{
		return;
	}
	if(queue.length)
	{
		queue.active = 1;
		var fn = function() { runWorkQueue(queue,1); };
		var cmd = queue.shift();
		if (cmd.args)
		{
			cmd.args[cmd.args.length] = fn;
			cmd.job.apply(null,cmd.args);
		}
		else
			cmd.job(fn);
		if (!queue.length && cmd.no_cb)
			queue.active = 0;
	}
	else
		queue.active = 0;
}

exports.add = addJob;
exports.run = runWorkQueue;
