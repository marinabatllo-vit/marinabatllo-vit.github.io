function selectDocument() {
    document.getElementById('fileInput').click();
}

function saveFile(input) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        var displayElement = document.querySelector('.sample-data');

        displayElement.textContent = file.name;

        const reader = new FileReader();

        reader.onload = function(e) {
            const text = e.target.result;
            let rows = text.split('\n').map(row => row.split(';'));

            // Now 'rows' holds the CSV file content as an array of arrays
            // You can check the output in the browser's console
            function replaceCommas(nestedArray) {
                return nestedArray.map(innerArray =>
                    innerArray.map(item => {
                        // Check if the item is a string and contains a comma
                        if (typeof item === 'string' && item.includes(',')) {
                            return item.replace(/,/g, '.');
                        }
                        return item;
                    })
                );
            }
            
            
            // Replace commas with periods
            rows = replaceCommas(rows);
            // Use 'rows' as needed for further processing

            const headers = rows[0];
            let nadh_data_init_A = []
            let nadh_data_init_B =[]
            let sample_data_init_D = []
            let sample_data_init_E =[]
            let sample_data_init_F = []
            let column_numbers_nadh=[]
            let control_data_init_G = []
            let control_data_init_H = []

            for (let i = 0; i < headers.length; i++) {
                if (headers[i].includes('A')) {
                    nadh_data_init_A.push(rows[1][i]);
                    column_numbers_nadh.push(i);
                }
                if(headers[i].includes('B')){
                    nadh_data_init_B.push(rows[1][i]);
                    column_numbers_nadh.push(i);
                }
                if(headers[i].includes('D')){
                    sample_data_init_D.push(rows[1][i]);
                }
                if(headers[i].includes('E')){
                    sample_data_init_E.push(rows[1][i]);
                }
                if(headers[i].includes('F')){
                    sample_data_init_F.push(rows[1][i]);
                }
                if(headers[i].includes('G')){
                    control_data_init_G.push(rows[1][i]);
                }
                if(headers[i].includes('H')){
                    control_data_init_H.push(rows[1][i]);
                }
            }

            nadh_data_init_A = nadh_data_init_A.map(Number);
            nadh_data_init_B = nadh_data_init_B.map(Number);
            sample_data_init_D = sample_data_init_D.map(Number)
            sample_data_init_E = sample_data_init_E.map(Number);
            sample_data_init_F = sample_data_init_F.map(Number);
            control_data_init_G = control_data_init_G.map(Number);
            control_data_init_H = control_data_init_H.map(Number);
            
    
            let nadh_data_init = nadh_data_init_A.map((a, i) => (a + nadh_data_init_B[i]) / 2);
            let blank = nadh_data_init[0]
            nadh_data_init = nadh_data_init.map(a => a - blank)
            let control_data_init = control_data_init_G.map((a, i) => ((a + control_data_init_H[i]) / 2) - blank)
            
            sample_data_init_D = sample_data_init_D.map(a => a -blank)
            sample_data_init_E = sample_data_init_E.map(a => a -blank)
            sample_data_init_F = sample_data_init_F.map(a => a -blank)
            
            


            // Now we will choose final data:
            function findLastColumnIndex(headers, char) {
                let index = -1;
                for (let i = 0; i < headers.length; i++) {
                    if (headers[i].includes(char)) {
                        index = i;
                    }
                }
                return index;
            }
            
            // Get data arrays based on headers
            let timeVector = rows.map(row => row[0]);
            let higherStandardIndex = findLastColumnIndex(rows[0], 'A');
            let lastSampleIndex = findLastColumnIndex(rows[0], 'D');
            let lastControlIndex = findLastColumnIndex(rows[0], 'G');
            
            let higherStandard = rows.map(row => row[higherStandardIndex]);
            let lastSample = rows.map(row => row[lastSampleIndex]);
            let lastControl = rows.map(row => row[lastControlIndex]);
            
            // Find final time index
            let finalTimeIndex = -1;
            for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
                if (rows[i][lastSampleIndex] > rows[i][higherStandardIndex]) {
                    finalTimeIndex = i - 1; // Subtracting 1 to get the previous index
                    break;
                }
                if(finalTimeIndex == -2){
                    finalTimeIndex = lastSample.length - 1
                }
            }
            
            let initial_time = rows[1][0]
            let final_time = rows[finalTimeIndex][0]
            console.log(final_time)
            let header = rows[0]

            function getColumnDataAsArray(rows, char, rowIndex) {
                let columnData = [];
                rows[0].forEach((header, index) => {
                    if (header.includes(char)) {
                        columnData.push(rows[rowIndex][index])
                    }
                });
                return columnData;
            }
            
            // Assuming 'finalTimeIndex' is adjusted to work with array index starting from 0
            let nadh_data_final_A = getColumnDataAsArray(rows, 'A', finalTimeIndex).map(Number);
            let nadh_data_final_B = getColumnDataAsArray(rows, 'B', finalTimeIndex).map(Number);
            let control_data_final_G = getColumnDataAsArray(rows, 'G', finalTimeIndex).map(Number);
            let control_data_final_H = getColumnDataAsArray(rows, 'H', finalTimeIndex).map(Number);
            let sample_data_final_D = getColumnDataAsArray(rows, 'D', finalTimeIndex).map(Number);
            let sample_data_final_E = getColumnDataAsArray(rows, 'E', finalTimeIndex).map(Number);
            let sample_data_final_F = getColumnDataAsArray(rows, 'F', finalTimeIndex).map(Number);
            
            // Assuming 'blank' is a number and calculations should be done per element
            let nadh_data_final = nadh_data_final_A.map((a, i) => ((a + nadh_data_final_B[i]) / 2) - blank);
            let control_data_final = control_data_final_G.map((a, i) => ((a + control_data_final_H[i]) / 2) - blank);
            sample_data_final_D = sample_data_final_D.map(a => a - blank)
            sample_data_final_E = sample_data_final_E.map(a => a - blank)
            sample_data_final_F = sample_data_final_F.map(a => a - blank)

            // Plot the standard curve of nadh (we need the concentrations)
            let concentrations_value = document.getElementById('concentrations').value;
            let concentrations_array = concentrations_value.split(',');
            let concentrations = concentrations_array.map(Number);
            let result = ss.linearRegression(concentrations.map((c,i) => [c, nadh_data_init[i]]));
            let slope = result.m;
            let intercept = result.b;
            let regressionLineY = concentrations.map(x => x * slope + intercept);

            let rSquared = ss.rSquared(concentrations.map((c, i) => [c, nadh_data_init[i]]), x => (slope * x + intercept));
            
            if(intercept>0){
                document.getElementById('equation-text').innerHTML = 'Equation: ' + slope.toFixed(2) + 'x+' + intercept.toFixed(4) ;
            }
            else{
                document.getElementById('equation-text').innerHTML = 'Equation: ' + slope.toFixed(2) + 'x' + intercept.toFixed(4) ;
            }

            document.getElementById('r2-text').innerHTML = 'R2: ' + rSquared.toFixed(2)

             function plot_data_nadh(){
                // Data for the plot:
                let traceData = {
                    x: concentrations,
                    y: nadh_data_init,
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Data',
                    marker: {
                        color: '#cfdb42', // Color for points
                        size: 10 // Larger point size
                    }
                };

                let traceRegression = {
                    x: concentrations,
                    y: regressionLineY,
                    mode: 'lines',
                    type: 'scatter',
                    name: 'Regression Line',
                    line: {
                        color: '#20285e', // Color for line
                        width: 3 // Thicker line
                    }
                };

                let layout = {
                    title: {
                        text: 'Concentration vs NADH Data',
                        font: {
                            size: 24, // Bigger title font size
                            color: '#20285e', // Title color
                            family: 'Lexend Deca' // Font family
                        }
                    },
                    xaxis: {
                        title: 'Concentration',
                        showgrid: false, // Remove gridlines
                        font: {
                            color: '#20285e', // Axes font color
                            family: 'Lexend Deca' // Font family
                        }
                    },
                    yaxis: {
                        title: 'NADH Concentration',
                        showgrid: false, // Remove gridlines
                        font: {
                            color: '#20285e', // Axes font color
                            family: 'Lexend Deca' // Font family
                        }
                    },
                    font: {
                        family: 'Lexend Deca', // General font for all text
                        color: '#20285e' // General font color
                    },
                    showlegend:false,
                    paper_bgcolor: 'transparent', // Optional: to make the background transparent
                    plot_bgcolor: 'transparent', // Optional: to make the plot background transparent
                };

                Plotly.newPlot('plot', [traceData, traceRegression], layout);
            }

            plot_data_nadh()

            let change_sample_D = sample_data_final_D.map((a,i)=> a- sample_data_init_D[i])
            let change_sample_E = sample_data_final_E.map((a,i)=> a- sample_data_init_E[i])
            let change_sample_F = sample_data_final_F.map((a,i)=> a- sample_data_init_F[i])
            let change_control = control_data_final.map((a,i) => a - control_data_init[i])

            let amount_nadh = nadh_data_final.map((a,i) => a-nadh_data_init[i])
            let amound_nadh_sample_D = change_sample_D.map(a => (a-intercept)/slope)
            let amound_nadh_sample_E = change_sample_E.map(a => (a-intercept)/slope)
            let amound_nadh_sample_F = change_sample_F.map(a => (a-intercept)/slope)
            
            let amount_nadh_control = change_control.map(a=> (a-intercept)/slope)

            let minutes_initial = initial_time.split(":")[1]
            let minutes_final = final_time.split(":")[1]

            let hours_final = Number(final_time.split(":")[0])
            console.log(hours_final)
            if(hours_final > 0){
                minutes_final = minutes_final + hours_final*60
            }

            reaction_time = minutes_final - minutes_initial;
            let volume = document.getElementById('volume').value;
            let dilution_factor = document.getElementById('dilution-factor').value;
            console.log(reaction_time)
            console.log(volume)
            console.log(dilution_factor)
            let ldh_activity_nadh = amount_nadh.map((a,i) => a/(reaction_time * volume) * dilution_factor)

            let ldh_activity_control = amount_nadh_control.map((a,i) => a/(reaction_time * volume) * dilution_factor)

            let ldh_activity_sample_D = amound_nadh_sample_D.map((a,i) => a/(reaction_time * volume) * dilution_factor)
            let ldh_activity_sample_E = amound_nadh_sample_E.map((a,i) => a/(reaction_time * volume) * dilution_factor)
            let ldh_activity_sample_F = amound_nadh_sample_F.map((a,i) => a/(reaction_time * volume) * dilution_factor)
            

            let table = document.querySelector('.table-results'); // Access the table
            let rows_table = table.rows; // Get the rows of the table

            let dataArrays = [ldh_activity_nadh, ldh_activity_sample_D, ldh_activity_sample_E, ldh_activity_sample_F, ldh_activity_control];
            for (let i = 1; i < rows_table.length; i++) { // Start at 1 to skip header row
                let cells = rows_table[i].cells;
                for (let j = 1; j < cells.length; j++) { // Start at 1 to skip row header cell
                    data_enter = dataArrays[i - 1][j - 1]
                    if (data_enter == undefined){
                        continue;
                    }
                    cells[j].textContent = data_enter.toFixed(4); // Assign data to each cell
                }
            }

            document.getElementById('plot-selection').addEventListener('change',(event) => {
                // Get the selected value
                const selectedValue = event.target.value;
    
                if(selectedValue == "nadh"){
                    plot_data_nadh()
                }
                else{
                    console.log('team')
                    let numColumns = ldh_activity_sample_D.length;
                    let colors = ['#21295F', '#CFDC43', '#FF9467', '#FF424C'];

                    let data_barplot = []
                    let x_scatter = []
                    let y_scatter = []
                    let compound = []
                    let value = 0
                    

                    for(let i=0; i < numColumns; i++){
                        compound = []
                        compound.push(ldh_activity_sample_D[i])
                        y_scatter.push(ldh_activity_sample_D[i])
                        compound.push(ldh_activity_sample_E[i])
                        y_scatter.push(ldh_activity_sample_E[i])
                        compound.push(ldh_activity_sample_F[i])
                        y_scatter.push(ldh_activity_sample_F[i])
                        compound = compound.filter(function( element ) {
                            return element !== undefined;
                         });
                        let mean_compound = compound.reduce((a, b) => a + b, 0) / compound.length;
                        data_barplot.push(mean_compound)
                        value = i + 1
                        console.log(compound)
                        console.log(value)
                        for(let j=0; j < compound.length; j++){
                            console.log('trial')
                            x_scatter.push(value)
                        }
                        }
                        console.log(x_scatter)
                        
                        y_scatter = y_scatter.filter(function( element ) {
                            return element !== undefined;
                         });
                        console.log(y_scatter)
                        
                    

                    let barData = {
                        x: Array.from({ length: numColumns }, (_, i) => i+1),
                        y: data_barplot,
                        type: 'bar',
                        marker: {
                            color: 'rgba(0,0,0,0)', // Transparent interior of the columns
                            line: {
                                color: colors.slice(0, numColumns), // Use sliced colors array based on numColumns
                                width: 3
                            }
                        }
                    }

                    let scatterData = {
                        x: x_scatter,
                        y: y_scatter,
                        mode: 'markers',
                        type: 'scatter',
                        name: 'Data',
                        marker: {
                            color: '#cfdb42', // Color for points
                            size: 10 // Larger point size
                        }
                    }

                    let layout = {
                        title: {
                            text: 'Comparison of Samples',
                            font: {
                                size: 24, // Bigger title font size
                                color: '#20285e', // Title color
                                family: 'Lexend Deca' // Font family
                            }
                        },
                        xaxis: {
                            title: 'Column',
                            showgrid: false, // Remove gridlines
                            font: {
                                color: '#20285e', // Axes font color
                                family: 'Lexend Deca' // Font family
                            }
                        },
                        yaxis: {
                            title: 'LDH Activity',
                            showgrid: false, // Remove gridlines
                            font: {
                                color: '#20285e', // Axes font color
                                family: 'Lexend Deca' // Font family
                            }
                        },
                        font: {
                            family: 'Lexend Deca', // General font for all text
                            color: '#20285e' // General font color
                        },
                        showlegend:false,
                        paper_bgcolor: 'transparent', // Optional: to make the background transparent
                        plot_bgcolor: 'transparent', // Optional: to make the plot background transparent
                    }

                    Plotly.newPlot('plot', [barData, scatterData], layout)
                    
                }})
            
            
            

        };

        reader.readAsText(file);

        // Manage the change in the plots:


        // If you need to do something with the file, you can proceed here
    }
}