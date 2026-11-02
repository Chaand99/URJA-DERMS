export function generateCortexReport(){

    return{

        healthScore:98,

        confidence:97,

        nodes:4,

        devices:18,

        alerts:1,

        solar:{
            status:"Solar generation is operating above today's expected forecast."
        },

        battery:{
            status:"Battery State of Charge is healthy with sufficient backup."
        },

        grid:{
            status:"Grid voltage and frequency remain within operational limits."
        },

        load:{
            status:"Building load is balanced with no abnormal demand spikes."
        },

        cost:{
            status:"Renewable contribution is reducing today's operating cost."
        },

        recommendations:[

            {

                priority:"HIGH",

                message:"Increase battery charging while solar surplus is available."

            },

            {

                priority:"MEDIUM",

                message:"Shift non-critical loads to renewable generation period."

            },

            {

                priority:"LOW",

                message:"Grid quality is stable. No corrective action required."

            }

        ],

        decisions:[

            {

                time:"09:42",

                message:"Battery charging recommended."

            },

            {

                time:"09:35",

                message:"Solar export enabled."

            },

            {

                time:"09:20",

                message:"Load balancing completed."

            }

        ],

        summary:
        "Overall system health is excellent. Solar production exceeds building demand, battery backup is healthy, and grid conditions remain stable. No immediate operator intervention is required."

    };

}