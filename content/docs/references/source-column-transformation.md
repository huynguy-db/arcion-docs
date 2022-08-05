---
title: Source Column Transformation
weight: 8
bookHidden: false
---

# Source Column Transformation
From version 22.07.19.3 onwards, Replicant allows you to transform the data of source tables before it reaches the desired target. This is achieved via a configuration file where you can specify the transformation logic for each individual table. As Replicant processes data from source tables, it applies the transformation rules to the data, and then loads the transformed data into the destination tables. The column on the destination could either be a new column, or a source column with transformed values.

Source Column Transformation solves several business cases for data migration, while making it possible to build new features like data encryption and obfuscation.

{{< hint "info" >}}Currently, Source Column Transformation is only supported for **MySQL->Databricks** pipeline.{{< /hint >}}

## Transformation Configuration File

The Transformation Conifiguration File has all the transformation logic specified on a per-table basis. You can access a sample config file called `column_transformation.yaml` from the `conf/transformation/` directory of your Replicant download folder `replicant-cli`. The following sample describes Transformation rules for two tables `nation` and `lineitem`:

```YAML
type: COLUMN
enable: true
per-table-config:
  - catalog: tpch                                    
    schema: public                                   
    tables:
      nation:
        operations:
          - modulo:                                  
              enable: true                           
              source-column: A                       
              mod-by-column: D                       
              mod-by-value: 5                        
              target-column: F                       
              target-column-datatype: "INTEGER"      
              target-column-key-type: SHARDKEY                        
          - concat:                                  
              enable: true                            
              source-column: P                        
              concat-by-columns: ["_", "column:Q"]   
              target-column: S                       
              target-column-datatype: ""             
          - trim:                                    
              enable: true                            
              source-column: X                        
              target-column: Y                       
              target-column-datatype: ""            
      lineitem:
        operations:
          - modulo:
              enable: true
              source-column: l_orderkey
              mod-by-column: l_partkey
              target-column: l_orderkey1
              target-column-datatype: "DECIMAL(15, 2)"
          - modulo:
              enable: true
              source-column: l_linenumber
              mod-by-value: 10
              target-column: l_linenumber
              target-column-datatype: ""
          - concat:
              enable: true
              source-column: l_comment
              concat-by-columns: [ " ", "column:l_shipmode", " ", "column:l_linestatus", " " ]
              target-column: concat_test
              target-column-datatype: "STRING(100)"
          - trim:
              enable: true
              source-column: l_shipinstruct
              target-column: trim_test
```

Below are more details about the parameters:

- **`type`**: The type of transformation. In this case the only allowed value is `COLUMN`.
- **`enable`**: `true` or `false` Whether to enable transformation or not.
- **`per-table-config`**: Specify transformation logic on a per-table basis. This allows you to specify different transformation logic for each table. For example, in the sample config above, we have different rules for `nation` and `lineitem` tables.
  - **`catalog`**: The database catalog. Disable this parameter if not supported by source.
  - **`schema`**: The database schema. Disable this parameter if not supported by source.
  - **`tables`**: The specific tables to apply Transformation to.
    - **`nation`**: 
      - **`operations`**:
        - **`modulo`**: Target-column is modulo of source-column by either `mod-by-column` or `mod-by-value`.
          - **`enable`**: `true` or `false`. Enables/disables this modulo operation.
          - **`source-column`**: Source column which we want to Transform. You must specify numeric value column only.
          - **`mod-by-column`**: The numeric value column used to calculate target column by modulo of source column: `F = A % D`. Don't specify `mod-by-column` if `mod-by-value` is used. Data type should be same as s`ource-column`.
          - **`mod-by-value`**: The value to calculate target column by module of source column: `F = A % 5`. Don't specify `mod-by-value` if `mod-by-column` is used.
          - **`target-column`**: The column as result of the modulo operation. This can either be the new column which will be created on target, or same source column or any other column in same table.
          - **`target-column-datatype`**: Specifies datatype for target column. If `null`, the datatype of `source-column` is used. If `target-column-datatype` is specified, then Replicant will try to convert the operation result into that datatype. The conversion might fail due to compatibility issue.
          - **`target-column-key-type`**: Supported value is `SHARDKEY`. If this parameter is specified, then it uses the target column as specified key type on Applier. As in this example, the target column `F` will be used as the `SHARDKEY` column on destination database.
        - **`concat`**: The `target-column` is a concatenation of `source-column` and `concat-by-columns`.
          - **`enable`**: `true` or `false`. Enables/disables this concat operation.
          - **`source-column`**: The source column name.
          - **`concat-by-columns`**: List of string values and column names which we want to concat with `source-column`. `"_"` indicates to concat this string value to source column. `"column: Q"` specifies concat value of column Q to source column. `"column:"` is column name identifier. Concatenation is done in the same order as specified in the list.
          - **`target-column`**: Target column is the result of concatenation. For example, in the sample config above, it is: `S = P + "_" + Q`.
          - **`target-column-datatype`**: Specifies datatype for target column. If `null`, the datatype of `source-column` is used.
        - **`trim`**: `target-column` is trim of `source-column`. Removes space from front and back of string.
          - **`enable`**: `true` or `false`. Enables/disables this concat operation.
              - **`source-column`**: Please specify source column name.
              - **`target-column`**: Target column is result of trim. For example,  in the sample config above, if `P = "name    "`, then `S = "name"`.
              - **`target-column-datatype`**: Specifies datatype for target column. If `null`, the datatype of source-column is used.

{{< hint "info" >}}
- Target column can be the same as source column, new column, or any other column in same table.
- If `target-column-datatype` is not specified and target column does not exist in source table, then Replicant will use the datatype of `source-column`.
- If `target-column-datatype` is specified, then Replicant will try its best to covert operation result into that datatype. The conversion might fail due to compatibility issue.
- If `target-column` exists in source table, then Replicant will use the datatype of `target-column`.

Our recommendation would be to not use `target-column-datatype`. In that case Replicant can fall back to using the datatype of `source-column`.
{{< /hint >}}

## Limitations

- Column can be a part of `source-column`, `target-column` in only one operation. For example, if column `F` is part of modulo operation as a `source-column` or `target-column`, then it cannot be used in any other operation.
- Certain operations support specific data types only. For example, the `modulo` operation can be performed on numeric types only.
- Only supported for `snapshot`, `realtime` and `full` mode for now.

## Running Replicant

The location of the Column Transformation file is supplied to Replicant via the `--transform` argument. For example, the following command runs Replicant in `snapshot` mode with the Transformation configuration file specified:

```shell
./bin/replicant snapshot \
 conf/conn/source_database_name_src.yaml \
 conf/conn/target_database_name_dst.yaml \
 --extractor conf/src/source_database_name.yaml \
 --applier conf/dst/target_database_name.yaml  \
 --filter filter/source_database_name_filter.yaml \
 --transform conf/transformation/column_transform.yaml \
 --id repl2 --replace –overwrite
```