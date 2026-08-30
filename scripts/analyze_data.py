#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de análisis técnico de los datos disponibles para Mi Embarazo CYL.
Inspecta todos los archivos de public/data/raw/ y genera metadatos estructurados.
NO modifica los datos originales.
"""

import os
import glob
import chardet
import pandas as pd
import numpy as np

# Directories
RAW_DIR = "public/data/raw"
SCRIPT_DIR = "scripts"
DOCS_DIR = "docs"


def detect_encoding(filepath):
    """Detect file encoding using chardet."""
    with open(filepath, "rb") as f:
        raw_data = f.read()
    result = chardet.detect(raw_data)
    return result["encoding"], result["confidence"]


def detect_separator(filepath, encoding):
    """Detect CSV separator by examining the first line."""
    with open(filepath, "r", encoding=encoding, errors="replace") as f:
        first_line = f.readline()
    
    # Check for semicolon
    if ";" in first_line and "," not in first_line[:20]:
        return ";"
    
    # Check for comma (but not inside quoted values)
    if "," in first_line:
        # Simple heuristic: if there are more commas than semicolons, use comma
        semicolon_count = first_line.count(";")
        comma_count = first_line.count(",")
        if comma_count > semicolon_count:
            return ","
    
    return ";"  # default


def count_nulls(series):
    """Count null/empty values in a pandas Series."""
    return series.isnull().sum() + (series.astype(str) == "").sum() - series.eq("").sum()


def get_examples(series, n=3):
    """Get representative non-null examples from a series."""
    examples = series.dropna().unique()
    if len(examples) == 0:
        return []
    return list(examples[:min(n, len(examples))])


def analyze_file(filepath):
    """Analyze a single data file and return structured metadata."""
    filename = os.path.basename(filepath)
    print(f"Analizando: {filename}")
    
    # Detect encoding and separator
    encoding, confidence = detect_encoding(filepath)
    print(f"  Encoding detectado: {encoding} (confianza: {confidence:.2f})")
    
    file_lower = filepath.lower()
    
    # Determine file type and read accordingly
    data = None
    columns = []
    record_count = 0
    sep = ";"
    
    if file_lower.endswith(".csv"):
        sep = detect_separator(filepath, encoding)
        print(f"  Separador detectado: '{sep}'")
        
        try:
            data = pd.read_csv(filepath, sep=sep, encoding=encoding, 
                              on_bad_lines="warn", dtype=str)
            # Clean column names
            data.columns = [c.strip() for c in data.columns]
            columns = data.columns.tolist()
            record_count = len(data)
        except Exception as e:
            print(f"  Error leyendo CSV: {e}")
            # Try with different encoding
            try:
                data = pd.read_csv(filepath, sep=sep, encoding="utf-8", 
                                  on_bad_lines="warn", dtype=str)
                data.columns = [c.strip() for c in data.columns]
                columns = data.columns.tolist()
                record_count = len(data)
            except Exception as e2:
                print(f"  Error secundario: {e2}")
                return None
    
    elif file_lower.endswith(".xlsx"):
        try:
            data = pd.read_excel(filepath, engine="openpyxl", dtype=str)
            data.columns = [c.strip() for c in data.columns]
            columns = data.columns.tolist()
            record_count = len(data)
        except Exception as e:
            print(f"  Error leyendo XLSX: {e}")
            return None
    
    else:
        print(f"  Formato no soportado: {filename}")
        return None
    
    if data is None:
        return None
    
    # Ensure we have string columns for analysis
    for col in data.columns:
        if data[col].dtype == object:
            data[col] = data[col].astype(str).replace("nan", "").replace("None", "")
    
    # Analyze each column
    column_analyses = []
    null_info = {}
    duplicate_count = data.duplicated().sum()
    
    for col in columns:
        # Basic stats
        null_count = count_nulls(data[col])
        null_pct = (null_count / record_count * 100) if record_count > 0 else 0
        unique_count = data[col].nunique()
        examples = get_examples(data[col], 3)
        
        # Type inference
        # Try to detect if numeric
        try:
            numeric_col = pd.to_numeric(data[col], errors="coerce")
            is_numeric = numeric_col.notna().sum() > 0 and numeric_col.notna().sum() / record_count > 0.5
            if is_numeric:
                dtype = "numérico"
                # Get actual type
                non_null_numeric = numeric_col[numeric_col.notna()]
                if non_null_numeric.dropna().empty:
                    dtype = "cadena (con números)"
            else:
                dtype = "cadena"
        except:
            dtype = "cadena"
        
        # Detect geographic fields
        geo_indicators = ["municipio", "provincia", "codigos", "postal", "INE", "ZBS", 
                         "consultorio", "centro", "hospital", "localidad", "cod_postal",
                         "cod_ine", "codigo_postal", "codigo_ine"]
        col_lower = col.lower().strip()
        is_geographic = any(ind in col_lower for ind in geo_indicators)
        
        # Detect coordinates
        is_coordinate = False
        try:
            # Check if values look like lat,long pairs
            sample_vals = data[col].dropna().unique()
            if len(sample_vals) > 0:
                for val in sample_vals:
                    if val.strip() and "," in val:
                        parts = val.split(",")
                        if len(parts) == 2:
                            try:
                                float(parts[0].strip())
                                float(parts[1].strip())
                                is_coordinate = True
                                break
                            except:
                                pass
        except:
            pass
        
        # Detect possible identifiers
        id_indicators = ["codigo", "code", "id", "num_", "num-"]
        is_possible_id = any(ind in col_lower for ind in id_indicators)
        
        col_analysis = {
            "nombre": col,
            "tipo": dtype,
            "nulos": int(null_count),
            "porcentaje_nulos": round(null_pct, 2),
            "valores_unicos": int(unique_count),
            "ejemplos": examples,
            "posible_geografica": is_geographic,
            "posible_coordenada": is_coordinate,
            "posible_identificador": is_possible_id
        }
        column_analyses.append(col_analysis)
        
        null_info[col] = {
            "count": int(null_count),
            "pct": round(null_pct, 2)
        }
    
    # Detect specific geographic fields across all columns
    geo_fields = {
        "provincia": False,
        "municipio": False,
        "localidad": False,
        "ZBS": False,
        "consultorio": False,
        "centro_salud": False,
        "hospital": False,
        "direccion": False,
        "latitud": False,
        "longitud": False,
        "codigo_postal": False,
        "codigo_INE": False
    }
    
    for col_analysis in column_analyses:
        if col_analysis["posible_geografica"]:
            for field in geo_fields:
                if field in col_analysis["nombre"].lower():
                    geo_fields[field] = True
    
    for col_analysis in column_analyses:
        if col_analysis["posible_coordenata"]:
            # Could be lat/long columns - check if there are two coordinate-like columns
            pass
    
    # Get overall dataset info
    info = {
        "nombre_archivo": filename,
        "formato": "CSV" if file_lower.endswith(".csv") else "XLSX",
        "registros": record_count,
        "columnas": len(columns),
        "columnas_detalle": column_analyses,
        "nulos_por_columna": null_info,
        "duplicados_registros": int(duplicate_count),
        "campos_geograficos": geo_fields,
        "archivo_ruta": filepath
    }
    
    print(f"  - Registros: {record_count}")
    print(f"  - Columnas: {len(columns)}")
    print(f"  - Duplicados: {duplicate_count}")
    print(f"  - Campos geográficos detectados: {geo_fields}")
    
    return info


def main():
    """Main function to analyze all data files."""
    os.makedirs(DOCS_DIR, exist_ok=True)
    os.makedirs(SCRIPT_DIR, exist_ok=True)
    
    # Find all CSV and XLSX files
    csv_files = glob.glob(os.path.join(RAW_DIR, "*.csv"))
    xlsx_files = glob.glob(os.path.join(RAW_DIR, "*.xlsx"))
    all_files = csv_files + xlsx_files
    
    print(f"Total archivos encontrados: {len(all_files)}")
    print(f"CSV: {len(csv_files)}")
    print(f"XLSX: {len(xlsx_files)}")
    print()
    
    results = []
    
    for filepath in sorted(all_files):
        result = analyze_file(filepath)
        if result is not None:
            results.append(result)
    
    # ---- GENERATE DATA_ANALYSIS.md ----
    # ... (will be generated separately based on results)
    # For now, save raw results for reference
    with open(os.path.join(DOCS_DIR, "raw_analysis_results.json"), "w", 
              encoding="utf-8") as f:
        import json
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nAnálisis completado. {len(results)} archivos procesados.")
    print(f"Resultados guardados en {DOCS_DIR}/raw_analysis_results.json")


if __name__ == "__main__":
    main()