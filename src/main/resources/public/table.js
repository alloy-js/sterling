let input = document.getElementById('input');
let open = d3.select('#open');
let comp = d3.select('#compact');
let blt = d3.select('#builtin');
let emp = d3.select('#empty');
let nxt = d3.select('#next');
let cmd = d3.select('#command');
let sig = d3.select('#sigs');
let fld = d3.select('#fields');
let sko = d3.select('#skolems');

let iscompact = false;
let showbuiltins = true;
let showemptys = true;

let socket;

initialize();

function initialize () {

    // Hide all of the buttons
    comp.style('display', 'none');
    blt.style('display', 'none');
    emp.style('display', 'none');
    nxt.style('display', 'none');

    // Set up event listeners
    open.on('click', () => input.click());
    comp.on('click', toggleCompact);
    blt.on('click', toggleBuiltins);
    emp.on('click', toggleEmptys);
    nxt.on('click', requestNext);

    socket = new WebSocket('ws://' + location.hostname + ':' + location.port + '/alloy');

    socket.addEventListener('open', function () {
        socket.send('current');
    });

    socket.addEventListener('message', function (event) {

        let data = event.data;

        if (data.startsWith('XML:')) {

            let instance = alloy.Instance.fromXML(data.slice(4));

            // Display tables
            setCommand(instance.command());
            setSignatures(instance.signatures());
            setFields(instance.fields());
            setSkolems(instance.skolems());

            // Display buttons
            comp.style('display', null);
            blt.style('display', null);
            emp.style('display', null);
            nxt.style('display', null);

        }

    });
}

function setCommand (command) {

    cmd.html(null);
    cmd.append('p').text(command);

}

function setSignatures (signatures) {

    signatures.sort((a, b) => {
        let c = b.atoms().length - a.atoms().length;
        if (c !== 0) return c;
        return b.label().toLowerCase() < a.label().toLowerCase() ? 1 : -1;
    });

    let modelsigs = signatures.filter(s => !s.builtin());
    let builtins = signatures.filter(s => s.builtin());

    sig.html(null);

    sigtables(sig.append('div').attr('class', 'horizontal'), modelsigs);
    sigtables(sig.append('div').attr('class', 'horizontal'), builtins, true);

}

function sigtables (selection, signatures, dim) {

    let sigs = selection.selectAll('table')
        .data(signatures)
        .enter()
        .append('table')
        .attr('class', 'signature')
        .style('display', sigdisplay);

    sigs.selectAll('thead')
        .data(d => [d.label()])
        .enter()
        .append('thead')
        .append('tr')
        .append('th')
        .attr('align', 'center')
        .style('color', textcolor(dim))
        .style('border', '1px solid ' + bordercolor(dim))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d);

    sigs.selectAll('tbody')
        .data(d => [d.atoms()])
        .enter()
        .append('tbody')
        .selectAll('tr')
        .data(d => d)
        .enter()
        .append('tr')
        .style('background-color', (d, i) => bgcolor(i, dim))
        .style('color', textcolor(dim))
        .append('td')
        .attr('align', 'center')
        .style('border', '1px solid ' + bordercolor(dim))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d);

}

function setFields (fields) {

    fields.sort((a, b) => {
        let c = b.tuples().length - a.tuples().length;
        if (c !== 0) return c;
        return b.label().toLowerCase() < a.label().toLowerCase() ? 1 : -1;
    });

    fld.html(null);

    let flds = fld.selectAll('table')
        .data(fields)
        .enter()
        .append('table')
        .attr('class', 'field')
        .style('display', fielddisplay);

    let header = flds.selectAll('thead')
        .data(d => [d])
        .enter()
        .append('thead');

    header
        .append('tr')
        .append('th')
        .attr('align', 'center')
        .attr('colspan', d => d.size())
        .style('border', '1px solid ' + bordercolor(false))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d.label());

    header
        .append('tr')
        .selectAll('th')
        .data(d => d.types())
        .enter()
        .append('th')
        .style('border', '1px solid ' + bordercolor(false))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d.label());

    flds.selectAll('tbody')
        .data(d => [d.tuples()])
        .enter()
        .append('tbody')
        .selectAll('tr')
        .data(d => d)
        .enter()
        .append('tr')
        .style('background-color', (d, i) => bgcolor(i, false))
        .style('color', textcolor(false))
        .selectAll('td')
        .data(d => d.atoms())
        .enter()
        .append('td')
        .attr('align', 'center')
        .style('border', '1px solid ' + bordercolor(false))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d.label());

}

function setSkolems (skolems) {

    sko.html(null);

    let skos = sko.selectAll('table')
        .data(skolems)
        .enter()
        .append('table')
        .attr('class', 'skolem');

    let header = skos.selectAll('thead')
        .data(d => [d])
        .enter()
        .append('thead');

    header
        .append('tr')
        .append('th')
        .attr('align', 'center')
        .attr('colspan', d => d.size())
        .style('border', '1px solid ' + bordercolor(false))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d.label());

    header
        .append('tr')
        .selectAll('th')
        .data(d => d.types())
        .enter()
        .append('th')
        .style('border', '1px solid ' + bordercolor(false))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d.label());

    skos.selectAll('tbody')
        .data(d => [d.tuples()])
        .enter()
        .append('tbody')
        .selectAll('tr')
        .data(d => d)
        .enter()
        .append('tr')
        .style('background-color', (d, i) => bgcolor(i, false))
        .style('color', textcolor(false))
        .selectAll('td')
        .data(d => d.atoms())
        .enter()
        .append('td')
        .attr('align', 'center')
        .style('border', '1px solid ' + bordercolor(false))
        .style('padding', iscompact ? '1px' : '5px')
        .text(d => d.label());

}

function bgcolor (i, dim) {
    return i%2 === 0
        ? dim
            ? '#efefef'  // dim color
            : '#cdcdcd'  // normal color
        : null;
}

function textcolor (dim) {
    return dim
        ? '#777777'  // dim color
        : null;       // normal color;
}

function bordercolor (dim) {
    return dim
        ? '#cdcdcd'
        : '#ababab'
}

function toggleCompact () {

    iscompact = !iscompact;

    d3.selectAll('td, th')
        .style('padding', iscompact ? '1px' : '5px');

    comp.text(iscompact ? 'Normal View' : 'Compact View');

}

function toggleBuiltins () {

    showbuiltins = !showbuiltins;

    d3.selectAll('.signature')
        .style('display', sigdisplay);

    blt.text(showbuiltins ? 'Hide Built-in Signatures' : 'Show Built-in Signatures');

}

function toggleEmptys () {

    showemptys = !showemptys;

    d3.selectAll('.signature')
        .style('display', sigdisplay);

    d3.selectAll('.field')
        .style('display', fielddisplay);

    emp.text(showemptys ? 'Hide Empty Tables' : 'Show Empty Tables');

}

function requestNext () {
    socket.send('next');
}

function sigdisplay (d) {
    let isbuiltin = d.builtin();
    let isempty = d.atoms().length === 0;
    let show = (showbuiltins || !isbuiltin) && (showemptys || !isempty);
    return show ? null : 'none'
}

function fielddisplay (d) {
    return showemptys || d.tuples().length ? null : 'none';
}
