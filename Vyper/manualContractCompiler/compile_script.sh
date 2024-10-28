#!/bin/bash
# script_dir=$(dirname "$0")
script_dir=$( pwd )
# echo "Script directory: $script_dir"

# temporarily add path:
export PATH=$PATH:$script_dir/bin/
# echo "Path: $PATH"

# check if compilers are executable:
for file in $script_dir/bin/*; do 
    if [[ ! -x "$file" ]]; then
        echo "At least one compiler file is not executable. Make it executable by running:"
        echo "chmod +x $file"
        echo "inside the $script_dir/bin/ folder all vyper and zksync compilers must be executable."
        exit
    fi
done

#zkvyper binary used:
zkyvyper="zkvyper-linux-amd64-gnu-v1.5.6"
#vyper binary used (supports 0.3.3, 0.3.9, 0.3.10 as of 24.10.24):
vyper="vyper.0.3.9+commit.66b96705.linux"

# compile
$zkyvyper --vyper $vyper $script_dir/contracts/*.vy --output-dir $script_dir/contracts-compiled/ --overwrite -f combined_json -O3 --fallback-Oz

# beautify json:
for file in $script_dir/contracts-compiled/*.json; do 
    store="$( jsonxf <$file )"
    echo "$store" > $file
done
