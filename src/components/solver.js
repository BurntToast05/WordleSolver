import React from "react";
import { useState, useEffect } from "react";
import { TextField, Typography } from "@mui/material";
import { Button, Stack, Grid, Box } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import words from "./words";
import commonWords from "./commonWords";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoModal from "./infoModal";
import Pagination from "@mui/material/Pagination";
import usePagination from "./pagination";

export default function WsordleSolver(props) {
  const [word, setWord] = useState("");
  const [possibleCharacters, setPossibleCharacters] = useState("");
  const [alreadyGuessed, setAlreadyGuessed] = useState("");
  const [availableWords, setAvailableWords] = useState([]);
  const [suggestionWord, setSuggestionWord] = useState("");
  const [secondBestSuggestion, setSecondBestSuggestion] = useState("");
  const [thirdBestSuggestion, setThirdBestSuggestion] = useState("");
  const [possibleCharacterHistory, setPossibleCharacterHistory] = useState([]);

  const [invalidCharacters, setInvalidCharacters] = useState("");
  const [firstGuess, setFirstGuess] = useState("");
  const [secondGuess, setSecondGuess] = useState("");
  const [thirdGuess, setThirdGuess] = useState("");
  const [fourthGuess, setFourthGuess] = useState("");
  const [fifthGuess, setFifthGuess] = useState("");

  const [firstColor, setFirstColor] = useState("");
  const [secondColor, setSecondColor] = useState("");
  const [thirdColor, setThirdColor] = useState("");
  const [fourthColor, setFourthColor] = useState("");
  const [fifthColor, setFifthColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [pastGuesses, setPastGuesses] = useState([]);
  const [pastColors, setPastColors] = useState([]);

  const [allAvailableChars, setAllAvailableChars] = useState(new Set());
  const [validWordsOnly, setValidWordsOnly] = useState(false);

  let [page, setPage] = useState(1);
  const PER_PAGE = 24;

  const count = Math.ceil(availableWords.length / PER_PAGE);
  const _DATA = usePagination(availableWords, PER_PAGE);

  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };

  const clearStates = () => {
    setWord("");
    setPossibleCharacters("");
    setAlreadyGuessed("");
    setAvailableWords([]);
    setSuggestionWord("");
    setSecondBestSuggestion("");
    setThirdBestSuggestion("");
    setPossibleCharacterHistory([]);
    setAllAvailableChars(new Set());

    setFirstColor("");
    setSecondColor("");
    setThirdColor("");
    setFourthColor("");
    setFifthColor("");

    setFirstGuess("");
    setSecondGuess("");
    setThirdGuess("");
    setFourthGuess("");
    setFifthGuess("");
    setPastGuesses([]);
    setPastColors([]);
  };

  const clearColors = () => {
    setFirstColor("");
    setSecondColor("");
    setThirdColor("");
    setFourthColor("");
    setFifthColor("");

    setFirstGuess("");
    setSecondGuess("");
    setThirdGuess("");
    setFourthGuess("");
    setFifthGuess("");
  };

  const handleButtonFill = (word) => {
    setFirstGuess(word[0]);
    setSecondGuess(word[1]);
    setThirdGuess(word[2]);
    setFourthGuess(word[3]);
    setFifthGuess(word[4]);

    setFirstColor("input");
    setSecondColor("input");
    setThirdColor("input");
    setFourthColor("input");
    setFifthColor("input");
  };

  const handleSubmitFunc = async () => {
    console.log("loading");
    setLoading(true);
    await handleSubmit();
    setLoading(false);
    console.log("done loading");
  };

  const GetBestSuggestion = (
    possibleWords,
    invalidChar,
    AvailableChars,
    commonWords
  ) => {
    try {
      if (possibleWords.length > 200) {
        //Creates a weight map based on number of words with the same character at specific indices
        let weightMap = new Map();
        possibleWords.forEach((word) => {
          for (let i = 0; i < word.length; i++) {
            if (weightMap.get(`${i}-${word[i]}`) === undefined) {
              weightMap.set(`${i}-${word[i]}`, 1);
            } else {
              weightMap.set(
                `${i}-${word[i]}`,
                weightMap.get(`${i}-${word[i]}`) + 1
              );
            }
          }
        });

        //Parses through the weight map and adds the values together to create a word map,
        //major precidence is given to words with all unique characters
        let wordWeightMap = new Map();
        possibleWords.forEach((word) => {
          let weight = 0;
          for (let i = 0; i < word.length; i++) {
            weight = weight + weightMap.get(`${i}-${word[i]}`);
          }
          if (isUnique(word)) {
            weight = weight + 5000;
          }
          wordWeightMap.set(word, weight);
        });

        //Get the largest weighted word in the map
        let max = 0;
        let firstSuggestion = "";
        let secondMax = 0;
        let secondSuggestion = "";
        let thirdMax = 0;
        let thirdSuggestion = "";

        wordWeightMap.forEach((key, value) => {
          let maxCopy = max;
          let firstSugCopy = firstSuggestion;
          let secondCopy = secondMax;
          let secondSugCopy = secondSuggestion;
          if (key >= max) {
            max = key;
            secondMax = maxCopy;
            thirdMax = secondCopy;
            firstSuggestion = value;
            secondSuggestion = firstSugCopy;
            thirdSuggestion = secondSugCopy;
          } else if (key >= secondMax) {
            secondMax = key;
            thirdMax = secondCopy;
            secondSuggestion = value;
            thirdSuggestion = secondSugCopy;
          } else if (key >= thirdMax) {
            thirdMax = key;
          }
        });
        return {
          suggestion: firstSuggestion,
          second: secondSuggestion,
          third: thirdSuggestion,
        };
      } else {
        let best = new Map();
        possibleWords.forEach((possibleWord) => {
          let getArray = [];
          possibleWords.forEach((wordToCheck) => {
            let invalidCharsAdded = invalidChar;
            for (let i = 0; i < wordToCheck.length; ++i) {
              if (!AvailableChars.has(possibleWord[i].toLowerCase())) {
                invalidCharsAdded = invalidCharsAdded.concat(wordToCheck[i]);
              }
            }
            for (let i = 0; i < 5; ++i) {
              //filter already guessed characters
              getArray = possibleWords.filter(function (str) {
                let valid = true;
                for (let i = 0; i < invalidCharsAdded.length; ++i) {
                  if (str.indexOf(invalidCharsAdded[i]) !== -1) {
                    valid = false;
                  }
                }
                return valid;
              });
            }
            best.set(wordToCheck, getArray.length);
          });
        });

        let smallestSize = 15000;
        let suggestion = "";
        let second = "";
        let third = "";
        best.forEach((value, key) => {
          if (
            value < smallestSize ||
            third === "" ||
            second === "" ||
            suggestion === ""
          ) {
            third = second;
            second = suggestion;
            suggestion = key;
            smallestSize = value;
          } else if (value === smallestSize) {
            let keyBoolean = false;
            let suggestionBoolean = false;
            commonWords.forEach((item) => {
              if (item === key) {
                keyBoolean = true;
              }
              if (item === suggestion) {
                suggestionBoolean = true;
              }
            });

            if (keyBoolean && !suggestionBoolean) {
              third = second;
              second = suggestion;
              suggestion = key;
            }
            smallestSize = value;
          }
        });
        return { suggestion, second, third };
      }
    } catch (err) {
      console.log(err);
      console.log("While Mapping");
    }
  };

  const handleSubmit = async (e) => {
    try {
      setSuggestionWord("");
      setSecondBestSuggestion("");
      setThirdBestSuggestion("");
      let wordString = "";
      let colorArray = [
        firstColor,
        secondColor,
        thirdColor,
        fourthColor,
        fifthColor,
      ];
      let guessArray = [
        firstGuess,
        secondGuess,
        thirdGuess,
        fourthGuess,
        fifthGuess,
      ];

      let newPastGuesses = [...pastGuesses];
      newPastGuesses.push(guessArray);
      setPastGuesses(newPastGuesses);
      let newPastColors = [...pastColors];
      newPastColors.push(colorArray);
      setPastColors(newPastColors);

      let posChar = "";
      for (let i = 0; i < 5; ++i) {
        if (colorArray[i] === "yellow") {
          posChar = posChar + guessArray[i].toLowerCase();
          let addThese = allAvailableChars;
          addThese = addThese.add(guessArray[i].toLowerCase());
          setAllAvailableChars(addThese);
        } else {
          posChar = posChar + "-";
        }
      }
      setPossibleCharacters(posChar);

      for (let i = 0; i < 5; ++i) {
        if (colorArray[i] === "green") {
          wordString = wordString + guessArray[i].toLowerCase();
          let addThese = allAvailableChars;
          addThese = addThese.add(guessArray[i].toLowerCase());
          setAllAvailableChars(addThese);
        } else {
          wordString = wordString + "-";
        }
      }
      setWord(wordString);

      let invalidChar = alreadyGuessed;
      for (let i = 0; i < 5; ++i) {
        if (colorArray[i] === "input") {
          let possibleChars = [];
          if (
            (alreadyGuessed.indexOf(guessArray[i]) === -1 ||
              alreadyGuessed === "") &&
            posChar.indexOf(guessArray[i]) === -1 &&
            wordString.indexOf(guessArray[i] === -1)
          )
            invalidChar = invalidChar + guessArray[i].toLowerCase();
        }
      }
      setAlreadyGuessed(invalidChar);

      let possibleWords = words;
      let array = possibleCharacterHistory;
      array.push(posChar);
      setPossibleCharacterHistory(array);

      for (let i = 0; i < 5; ++i) {
        //filter already guessed characters
        let newArray = possibleWords.filter(function (str) {
          let valid = true;
          for (let i = 0; i < invalidChar.length; ++i) {
            if (!allAvailableChars.has(invalidChar[i])) {
              if (str.indexOf(invalidChar[i]) !== -1) {
                valid = false;
              }
            }
          }
          return valid;
        });
        possibleWords = newArray;
      }

      for (let i = 0; i < 5; ++i) {
        //make sure possible words only includes words with possible characters
        let newArray = possibleWords.filter(function (str) {
          let valid = true;
          for (let j = 0; j < array.length; ++j) {
            let value = array[j];
            for (let i = 0; i < value.length; ++i) {
              if (value[i] !== "-") {
                if (str.indexOf(value[i]) === -1) {
                  valid = false;
                }
                if (str[i] === value[i]) {
                  valid = false;
                }
              }
            }
          }
          return valid;
        });
        possibleWords = newArray;
        newArray = [];
      }

      //Rule out words without all of the words in the word, or possible characters

      let newArray = [];
      newArray = possibleWords.filter(function (str) {
        let valid = true;
        for (let i = 0; i < 5; ++i) {
          if (wordString[i] !== "-") {
            if (str[i] !== wordString[i]) {
              valid = false;
            }
          }
        }
        return valid;
      });
      possibleWords = newArray;
      newArray = [];

      setAvailableWords(possibleWords);

      if (!validWordsOnly) {
        if (possibleWords.length < 14000) {
          let data = await GetBestSuggestion(
            possibleWords,
            invalidChar,
            allAvailableChars,
            commonWords
          );
          setSuggestionWord(data.suggestion);
          setSecondBestSuggestion(data.second);
          setThirdBestSuggestion(data.third);
        } else {
          let data = "";
          for (let i = 0; i < commonWords.length; ++i) {
            if (possibleWords.indexOf(commonWords[i]) !== -1) {
              data = commonWords[i];
              setSuggestionWord(data);
            }
          }
          if (data === "") {
            let first = "";
            let second = "";
            let third = "";
            for (let i = 0; i < commonWords.length; ++i) {
              if (first === "") {
                if (isUnique(possibleWords[i])) {
                  first = possibleWords[i];
                  setSuggestionWord(possibleWords[i]);
                }
              } else if (second === "") {
                if (isUnique(possibleWords[i])) {
                  second = possibleWords[i];
                  setSecondBestSuggestion(possibleWords[i]);
                }
              } else if (third === "") {
                if (isUnique(possibleWords[i])) {
                  third = possibleWords[i];
                  setThirdBestSuggestion(possibleWords[i]);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      console.log("setting available words");
    }
    clearColors();
  };

  function handleKeyPress(e) {
    var key = e.keyCode;

    if (key === 8) {
      if (e.target.id === "box1") {
        setFirstGuess("");
        setFirstColor("");
        document.getElementById("box1").focus();
      }
      if (e.target.id === "box2") {
        setSecondGuess("");
        setSecondColor("");
        document.getElementById("box1").focus();
      }
      if (e.target.id === "box3") {
        setThirdGuess("");
        setThirdColor("");
        document.getElementById("box2").focus();
      }
      if (e.target.id === "box4") {
        setFourthGuess("");
        setFourthColor("");
        document.getElementById("box3").focus();
      }
      if (e.target.id === "box5") {
        setFifthGuess("");
        setFifthColor("");
        document.getElementById("box4").focus();
      }
    }
  }

  const isUnique = (str) => {
    return new Set(str).size == str.length;
  };

  return (
    <>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ mt: 3 }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          sx={{ marginBottom: 2 }}
          textAlign="center"
        >
          <Typography variant="h5">Hard Wordle Solver</Typography>
          <InfoModal></InfoModal>
        </Stack>
        {!loading
          ? pastGuesses.map((guessArray, arrayIndex) => {
              return (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ width: 0.5, marginBottom: 2 }}
                  textAlign="center"
                >
                  {guessArray.map((guessNum, index) => {
                    return (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            p: 0,
                            m: 0,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                            justifyContent: "center",
                            boxShadow: 3,
                          }}
                        >
                          {pastColors[arrayIndex][index] === "green" ? (
                            <TextField
                              sx={{
                                width: 60,
                                "& .MuiFilledInput-root": {
                                  bgcolor: "success.main",
                                },
                              }}
                              inputProps={{
                                style: {
                                  fontSize: 40,
                                  textAlign: "center",
                                  padding: 0,
                                },
                                maxLength: 1,
                              }}
                              autoComplete="off"
                              variant="filled"
                              value={guessNum.toUpperCase()}
                              disabled
                            />
                          ) : pastColors[arrayIndex][index] === "input" ? (
                            <TextField
                              sx={{
                                width: 60,
                                "& .MuiFilledInput-root": {
                                  bgcolor: "secondary.main",
                                },
                              }}
                              inputProps={{
                                style: {
                                  fontSize: 40,
                                  textAlign: "center",
                                  padding: 0,
                                },
                                maxLength: 1,
                              }}
                              autoComplete="off"
                              variant="filled"
                              value={guessNum.toUpperCase()}
                              disabled
                            />
                          ) : pastColors[arrayIndex][index] === "yellow" ? (
                            <TextField
                              sx={{
                                width: 60,
                                "& .MuiFilledInput-root": {
                                  bgcolor: "warning.main",
                                },
                              }}
                              inputProps={{
                                style: {
                                  fontSize: 40,
                                  textAlign: "center",
                                  padding: 0,
                                },
                                maxLength: 1,
                              }}
                              autoComplete="off"
                              variant="filled"
                              value={guessNum.toUpperCase()}
                              disabled
                            />
                          ) : (
                            ""
                          )}
                        </Box>
                      </>
                    );
                  })}
                </Stack>
              );
            })
          : ""}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ width: 0.5, marginBottom: 2 }}
          textAlign="center"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 0,
              m: 0,
              bgcolor: "background.paper",
              borderRadius: 1,
              justifyContent: "center",
            }}
          >
            {firstColor === "green" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "success.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box1"
                autoComplete="off"
                variant="filled"
                value={firstGuess.toUpperCase()}
                onChange={(e) => {
                  setFirstGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box2").focus();
                  }
                  setFirstColor("input");
                }}
                autoFocus={true}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : firstColor === "input" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "secondary.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box1"
                autoComplete="off"
                variant="filled"
                value={firstGuess.toUpperCase()}
                onChange={(e) => {
                  setFirstGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box2").focus();
                  }
                  setFirstColor("input");
                }}
                autoFocus={true}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : firstColor === "yellow" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "warning.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box1"
                autoComplete="off"
                variant="filled"
                value={firstGuess.toUpperCase()}
                onChange={(e) => {
                  setFirstGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box2").focus();
                  }
                  setFirstColor("input");
                }}
                autoFocus={true}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : (
              <TextField
                sx={{ width: 60 }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box1"
                autoComplete="off"
                variant="filled"
                value={firstGuess.toUpperCase()}
                onChange={(e) => {
                  setFirstGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box2").focus();
                  }
                  setFirstColor("input");
                }}
                autoFocus={true}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            )}
            <Button
              onClick={() => {
                if (firstColor === "input") {
                  setFirstColor("green");
                } else if (firstColor === "green") {
                  setFirstColor("yellow");
                } else {
                  setFirstColor("input");
                }
              }}
              variant="text"
              sx={{ margin: 0, padding: 0 }}
            >
              TOGGLE
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 0,
              m: 0,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            {secondColor === "input" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "secondary.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box2"
                autoComplete="off"
                variant="filled"
                value={secondGuess.toUpperCase()}
                onChange={(e) => {
                  setSecondGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box3").focus();
                  }
                  setSecondColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : secondColor === "green" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "success.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box2"
                autoComplete="off"
                variant="filled"
                value={secondGuess.toUpperCase()}
                onChange={(e) => {
                  setSecondGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box3").focus();
                  }
                  setSecondColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : secondColor === "yellow" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "warning.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box2"
                autoComplete="off"
                variant="filled"
                value={secondGuess.toUpperCase()}
                onChange={(e) => {
                  setSecondGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box3").focus();
                  }
                  setSecondColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : (
              <TextField
                sx={{ width: 60 }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box2"
                autoComplete="off"
                variant="filled"
                value={secondGuess.toUpperCase()}
                onChange={(e) => {
                  setSecondGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box3").focus();
                  }
                  setSecondColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            )}
            <Button
              onClick={() => {
                if (secondColor === "input") {
                  setSecondColor("green");
                } else if (secondColor === "green") {
                  setSecondColor("yellow");
                } else {
                  setSecondColor("input");
                }
              }}
              variant="text"
              sx={{ margin: 0, padding: 0 }}
            >
              TOGGLE
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 0,
              m: 0,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            {thirdColor === "input" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "secondary.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box3"
                autoComplete="off"
                variant="filled"
                value={thirdGuess.toUpperCase()}
                onChange={(e) => {
                  setThirdGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box4").focus();
                  }
                  setThirdColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : thirdColor === "green" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "success.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box3"
                autoComplete="off"
                variant="filled"
                value={thirdGuess.toUpperCase()}
                onChange={(e) => {
                  setThirdGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box4").focus();
                  }
                  setThirdColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : thirdColor === "yellow" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "warning.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box3"
                autoComplete="off"
                variant="filled"
                value={thirdGuess.toUpperCase()}
                onChange={(e) => {
                  setThirdGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box4").focus();
                  }
                  setThirdColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : (
              <TextField
                sx={{ width: 60 }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box3"
                autoComplete="off"
                variant="filled"
                value={thirdGuess.toUpperCase()}
                onChange={(e) => {
                  setThirdGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box4").focus();
                  }
                  setThirdColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            )}
            <Button
              onClick={() => {
                if (thirdColor === "input") {
                  setThirdColor("green");
                } else if (thirdColor === "green") {
                  setThirdColor("yellow");
                } else {
                  setThirdColor("input");
                }
              }}
              variant="text"
              sx={{ margin: 0, padding: 0 }}
            >
              TOGGLE
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 0,
              m: 0,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            {fourthColor === "input" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "secondary.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box4"
                autoComplete="off"
                variant="filled"
                value={fourthGuess.toUpperCase()}
                onChange={(e) => {
                  setFourthGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box5").focus();
                  }
                  setFourthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : fourthColor === "green" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "success.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box4"
                autoComplete="off"
                variant="filled"
                value={fourthGuess.toUpperCase()}
                onChange={(e) => {
                  setFourthGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box5").focus();
                  }
                  setFourthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : fourthColor === "yellow" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "warning.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box4"
                autoComplete="off"
                variant="filled"
                value={fourthGuess.toUpperCase()}
                onChange={(e) => {
                  setFourthGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box5").focus();
                  }
                  setFourthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : (
              <TextField
                sx={{ width: 60 }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box4"
                autoComplete="off"
                variant="filled"
                value={fourthGuess.toUpperCase()}
                onChange={(e) => {
                  setFourthGuess(e.target.value);
                  if (e.target.value !== "") {
                    document.getElementById("box5").focus();
                  }
                  setFourthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            )}
            <Button
              onClick={() => {
                if (fourthColor === "input") {
                  setFourthColor("green");
                } else if (fourthColor === "green") {
                  setFourthColor("yellow");
                } else {
                  setFourthColor("input");
                }
              }}
              variant="text"
              sx={{ margin: 0, padding: 0 }}
            >
              TOGGLE
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              p: 0,
              m: 0,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            {fifthColor === "input" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "secondary.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box5"
                autoComplete="off"
                variant="filled"
                value={fifthGuess.toUpperCase()}
                onChange={(e) => {
                  setFifthGuess(e.target.value);
                  setFifthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : fifthColor === "green" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "success.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box5"
                autoComplete="off"
                variant="filled"
                value={fifthGuess.toUpperCase()}
                onChange={(e) => {
                  setFifthGuess(e.target.value);
                  setFifthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : fifthColor === "yellow" ? (
              <TextField
                sx={{
                  width: 60,
                  "& .MuiFilledInput-root": {
                    bgcolor: "warning.main",
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box5"
                autoComplete="off"
                variant="filled"
                value={fifthGuess.toUpperCase()}
                onChange={(e) => {
                  setFifthGuess(e.target.value);
                  setFifthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            ) : (
              <TextField
                sx={{ width: 60 }}
                inputProps={{
                  style: {
                    fontSize: 40,
                    textAlign: "center",
                    padding: 0,
                  },
                  maxLength: 1,
                }}
                id="box5"
                autoComplete="off"
                variant="filled"
                value={fifthGuess.toUpperCase()}
                onChange={(e) => {
                  setFifthGuess(e.target.value);
                  setFifthColor("input");
                }}
                onKeyDown={(e) => handleKeyPress(e)}
              />
            )}
            <Button
              onClick={() => {
                if (fifthColor === "input") {
                  setFifthColor("green");
                } else if (fifthColor === "green") {
                  setFifthColor("yellow");
                } else {
                  setFifthColor("input");
                }
              }}
              variant="text"
              sx={{ margin: 0, padding: 0 }}
            >
              TOGGLE
            </Button>
          </Box>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            p: 0,
            m: 0,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          {validWordsOnly ? (
            <Button
              onClick={() => {
                handleSubmitFunc();
                document.getElementById("box1").focus();
              }}
              variant="contained"
              id="getSuggestion"
              sx={{ marginRight: 2 }}
              color="info"
            >
              Valid Words
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleSubmitFunc();
                document.getElementById("box1").focus();
              }}
              variant="contained"
              id="getSuggestion"
              sx={{ marginRight: 2 }}
              color="info"
            >
              Suggestion
            </Button>
          )}

          <Button
            onClick={() => {
              clearStates();
              document.getElementById("box1").focus();
            }}
            variant="contained"
            color="info"
          >
            I Got It!
          </Button>
          <Switch
            checked={validWordsOnly}
            onChange={() => {
              setValidWordsOnly(!validWordsOnly);
            }}
          ></Switch>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex" }}>
            <Typography sx={{ mt: 3, mr: 2 }} variant="h6">
              Loading
            </Typography>{" "}
            <CircularProgress disableShrink sx={{ mt: 3 }} />
          </Box>
        ) : (
          <>
            {!validWordsOnly ? (
              <>
                {suggestionWord !== "" ? (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 300,
                      bgcolor: "background.paper",
                      margin: 2,
                      boxShadow: 3,
                    }}
                  >
                    <nav aria-label="secondary mailbox folders">
                      <List>
                        {suggestionWord !== "" ? (
                          <ListItem disablePadding>
                            <ListItemButton
                              component="a"
                              onClick={() =>
                                handleButtonFill(suggestionWord.toLowerCase())
                              }
                            >
                              <ListItemText
                                primary={
                                  suggestionWord !== ""
                                    ? `Suggestion 1: ${suggestionWord.toUpperCase()}`
                                    : ""
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ) : (
                          ""
                        )}

                        {secondBestSuggestion !== "" ? (
                          <>
                            <Divider />
                            <ListItem disablePadding>
                              {" "}
                              <ListItemButton
                                component="a"
                                onClick={() =>
                                  handleButtonFill(
                                    secondBestSuggestion.toLowerCase()
                                  )
                                }
                              >
                                <ListItemText
                                  primary={
                                    secondBestSuggestion !== ""
                                      ? `Suggestion 2: ${secondBestSuggestion.toUpperCase()}`
                                      : ""
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          </>
                        ) : (
                          ""
                        )}

                        {thirdBestSuggestion !== "" ? (
                          <>
                            <Divider />
                            <ListItem disablePadding>
                              <ListItemButton
                                component="a"
                                onClick={() =>
                                  handleButtonFill(
                                    thirdBestSuggestion.toLowerCase()
                                  )
                                }
                              >
                                <ListItemText
                                  primary={
                                    thirdBestSuggestion !== ""
                                      ? `Suggestion 3: ${thirdBestSuggestion.toUpperCase()}`
                                      : ""
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          </>
                        ) : (
                          ""
                        )}
                      </List>
                    </nav>
                  </Box>
                ) : (
                  ""
                )}
              </>
            ) : (
              ""
            )}

            {availableWords.length > 0 ? (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  bgcolor: "background.paper",
                  boxShadow: 3,
                  mt: 2,
                  mb: 3,
                }}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>
                      Valid Words: {availableWords.length}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Pagination
                      count={count}
                      size="small"
                      page={page}
                      onChange={handleChange}
                      color="success"
                    />

                    <List p="10" pt="3" spacing={2}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                        }}
                      >
                        {_DATA.currentData().map((word) => {
                          return (
                            <ListItem
                              key={word}
                              onClick={() => handleButtonFill(word)}
                              style={{ cursor: "pointer" }}
                            >
                              <Typography>{word.toUpperCase()}</Typography>
                            </ListItem>
                          );
                        })}
                      </Box>
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ) : (
              ""
            )}
          </>
        )}
      </Grid>
    </>
  );
}
