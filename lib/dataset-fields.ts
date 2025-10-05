export type DatasetKey = "kepler" | "k2" | "tess"

export type DatasetFieldType = "int" | "float" | "string"

export interface DatasetFieldDef {
  key: string
  name: string
  description: string
  type: DatasetFieldType
  required: boolean
  placeholder?: string
  defaultValue?: string | number
  exampleValue?: string
  min?: string
  max?: string
}

const KEPLER_FIELDS: DatasetFieldDef[] = [
  {
    key: "koi_fpflag_ss",
    name: "Stellar Eclipse Flag",
    description:
      "A KOI that is observed to have a significant secondary event, transit shape, or out-of-eclipse variability, which indicates that the transit-like event is most likely caused by an eclipsing binary.",
    type: "int",
    required: false,
    placeholder: "0 | 1",
    exampleValue: "1",
    min: "0",
    max: "1"
  },
  {
    key: "koi_fpflag_nt",
    name: "Not Transit-Like Flag",
    description:
      "KOI whose light curve is not consistent with that of a transiting planet (instrumental artifacts or non-transiting variability).",
    type: "int",
    required: false,
    placeholder: "0 | 1",
    exampleValue: "1",
    min: "0",
    max: "1"
  },
  {
    key: "koi_fpflag_co",
    name: "Centroid Offset Flag",
    description:
      "Source of the signal is from a nearby star as inferred by measuring the centroid location of the image, or by the strength of the transit signal in the target's outer pixels.",
    type: "int",
    required: false,
    placeholder: "0 | 1",
    exampleValue: "1",
    min: "0",
    max: "1"
  },
  {
    key: "koi_fpflag_ec",
    name: "Ephemeris Match Indicates Contamination Flag",
    description:
      "The KOI shares the same period and epoch as another object and is judged to be the result of flux contamination or electronic crosstalk.",
    type: "int",
    required: false,
    placeholder: "0 | 1",
    exampleValue: "1",
    min: "0",
    max: "1"
  },
  {
    key: "koi_model_snr",
    name: "Transit Signal-to-Noise",
    description: "Transit depth normalized by the mean uncertainty in the flux during the transits.",
    type: "float",
    required: false,
    placeholder: "15.0",
    exampleValue: "15.0"
  },
  {
    key: "koi_prad",
    name: "Planetary Radius (Earth radii)",
    description:
      "The radius of the planet. Planetary radius is the product of the planet star radius ratio and the stellar radius.",
    type: "float",
    required: false,
    placeholder: "1.2",
    exampleValue: "1.2"
  },
  {
    key: "koi_duration_err1",
    name: "Transit Duration (hours) – Uncertainty +",
    description:
      "Duration of observed transits uncertainty (+). Contact times are typically computed from a best-fit Mandel–Agol model.",
    type: "float",
    required: false,
    placeholder: "0.1",
    exampleValue: "0.1"
  },
  {
    key: "koi_steff_err1",
    name: "Stellar Effective Temperature (K) – Uncertainty +",
    description: "Photospheric temperature of the star (positive uncertainty).",
    type: "float",
    required: false,
    placeholder: "50",
    exampleValue: "50"
  },
  {
    key: "koi_steff_err2",
    name: "Stellar Effective Temperature (K) – Uncertainty -",
    description: "Photospheric temperature of the star (negative uncertainty).",
    type: "float",
    required: false,
    placeholder: "50",
    exampleValue: "50"
  },
]

const K2_FIELDS: DatasetFieldDef[] = [
  {
    key: "sy_pnum",
    name: "Number of Planets",
    description: "Number of confirmed planets in the planetary system",
    type: "int",
    required: false,
    placeholder: "0",
    exampleValue: "0"
  },
  {
    key: "soltype",
    name: "Solution Type",
    description: "Disposition of planet according to given planet parameter set",
    type: "string",
    required: true,
    placeholder: "Published Confirmed",
    defaultValue: "Published Confirmed",
    exampleValue: "Published Confirmed"
  },
  {
    key: "pl_orbper",
    name: "Orbital Period [days]",
    description: "Time the candidate takes to make a complete orbit around the host star or system.",
    type: "float",
    required: false,
    placeholder: "0.1",
    exampleValue: "0.1"
  },
  {
    key: "sy_vmag",
    name: "V-band (Johnson) [mag]",
    description: "Brightness of the host star as measured using the V (Johnson) band in units of magnitudes.",
    type: "float",
    required: false,
    placeholder: "10.5",
    exampleValue: "10.5"
  },
  {
    key: "sy_kmag",
    name: "Ks-band (2MASS) [mag]",
    description: "Brightness of the host star as measured using the Ks band in units of magnitudes.",
    type: "float",
    required: false,
    placeholder: "9.3",
    exampleValue: "9.3"
  },
  {
    key: "sy_gaiamag",
    name: "Gaia Magnitude",
    description: "Brightness of the host star as measured by Gaia in magnitudes.",
    type: "float",
    required: false,
    placeholder: "12.0",
    exampleValue: "12.0"
  },
  {
    key: "st_rad",
    name: "Stellar Radius [Solar radii]",
    description: "Length of a line segment from the center of the star to its surface, in units of solar radii.",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "sy_dist",
    name: "Stellar Distance [pc]",
    description: "Distance to the system in parsecs.",
    type: "float",
    required: false,
    placeholder: "100.0",
    exampleValue: "100.0"
  },
]

const TESS_FIELDS: DatasetFieldDef[] = [
  {
    key: "st_tmag",
    name: "TESS Magnitude",
    description: "Brightness of the host star as measured using the TESS-band in units of magnitudes as reported in the TESS Input Catalog.",
    type: "float",
    required: true,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "pl_tranmid",
    name: "Planet Transit Midpoint [BJD]",
    description: "The time given by the average of the time the planet begins to cross the stellar limb and the time the planet finishes crossing the stellar limb.",
    type: "float",
    required: true,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "pl_tranmiderr2",
    name: "Planet Transit Midpoint [BJD] Uncertainties Column (negative -)",
    description: "",
    type: "float",
    required: true,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "st_dist",
    name: "Stellar Distance [pc]",
    description: "Distance to the planetary system in units of parsecs as reported in the TESS Input Catalog.",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "pl_eqt",
    name: "Planet Equilibrium Temperature [K]",
    description: "The equilibrium temperature of the planet as modeled by a black body heated only by its host star.",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "pl_insol",
    name: "Planet Insolation [Earth flux]",
    description: "Insolation flux is the measure of the amount of stellar radiation received by the planet in units relative to that measured from the Earth from the Sun.",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "st_disterr",
    name: "Stellar Distance [pc] Uncertainties Column (negative -)",
    description: "",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "st_disterr1",
    name: "Stellar Distance [pc] Uncertainties Column (positive +)",
    description: "",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "pl_rade",
    name: "Planet Radius [R_Earth]",
    description: "Length of a line segment from the center of the planet to its surface, measured in units of radius of the Earth.",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
  {
    key: "st_raderr2",
    name: "Stellar Radius [R_Sun] Uncertainties Column (negative -)",
    description: "",
    type: "float",
    required: false,
    placeholder: "1.0",
    exampleValue: "1.0"
  },
]

export function getDatasetFields(dataset: DatasetKey): DatasetFieldDef[] {
  if (dataset === "kepler") return KEPLER_FIELDS
  if (dataset === "k2") return K2_FIELDS
  return TESS_FIELDS
}


