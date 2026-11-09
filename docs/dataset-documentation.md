# CropLens AI - Dataset Documentation & Evaluation Protocol

## 1. Primary Dataset Attribution
- **Dataset Title**: Sri Lankan Tea Leaf Dataset – Version 5
- **Publisher**: Mendeley Data
- **DOI / URL**: https://data.mendeley.com/datasets/sjmy6k24d6/5
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Stated Scope**: Photographs of tea leaves (*Camellia sinensis*) collected across tea growing districts in Sri Lanka.
- **Composition**:
  - Original standardized photographs: **1,791**
  - Total images including geometric & photometric augmentations: **4,177**
  - Condition classes: **6**

## 2. Supported Dataset Categories
1. `ALGAL_LEAF_SPOT` (*Cephaleuros virescens*) - Plant Pathology (Algal foliar disease)
2. `BLACK_BLIGHT` (*Corticium theae* / *Corticium invisum*) - Plant Pathology (Stem and leaf black rot)
3. `BLISTER_BLIGHT` (*Exobasidium vexans*) - Plant Pathology (Obligate fungal blister pathogen of tender flush)
4. `GRAY_BLIGHT` (*Pestalotiopsis theae*) - Plant Pathology (Wound fungal disease characterized by concentric gray rings)
5. `SPIDER_MITES` (*Oligonychus coffeae* / *Brevipalpus californicus*) - Entomology & Nematology (Sap-sucking arachnid PEST)
6. `HEALTHY` (*Camellia sinensis*) - Normal, vigorous foliage free from lesions and mite webbing

## 3. Critical Academic Data Quality Observations

### 3.1 Unbalanced Class Distribution Notice
The aggregate counts displayed on the public dataset landing page conflate original images with synthetic data augmentations. The published documentation does not establish uniform counts across all original classes. CropLens AI explicitly does not fabricate uniform numbers, but instead references verified original samples for ground-truth testing.

### 3.2 Augmentation Independence
Augmented versions (rotations, flips, crops) are derived from original specimens and do not constitute independent biological instances. Evaluation protocols must evaluate model discrimination against distinct original specimens.

### 3.3 Pest vs. Disease Biological Reality
The dataset class labeled "Spider Mites" is explicitly an **arachnid pest** infestation. CropLens AI enforces this taxonomic separation, ensuring growers understand that fungicide spray regimes are inappropriate and counter-productive for mite control.

### 3.4 Multimodal Vision vs. Custom Training Claims
CropLens AI employs the multimodal Google Gemini Vision API for actual zero-shot and few-shot image interpretation. In accordance with university research ethics, this project does NOT claim to have trained a custom CNN or MobileNet model on the dataset. The dataset serves as a documented testing and evaluation benchmark.
