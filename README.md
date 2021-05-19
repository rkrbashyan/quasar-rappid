# Humanizing Technologies: Challenge #1

## Technologies

1.  What tools and software packages would you suggest? Please provide a reason / short explanation for your suggestions and how they compare to different tools.

        Tools used for Chanlenge #2 and my initial understanding of the project are definitely
        resanable choice. Although Rappid.js documentation is far from being perfect and it takes
        considerable amount of time to get on board. The necessity of other tools would be evaluated
        after more deep knowledge of the project.

2.  How would you define and ensure code quality?

        In this order:

        Clarity – Easy to read and legible to anyone who has not written the code themselves.

        Maintainability – An easy to understand the context and not being over-complicated
        makes it easier to make changes in the code if required.

        Well-tested – The less amount of bugs a software has, the higher its quality is.

        Efficiency – High-quality code uses the resources available to its optimally to perform
        the desired action.

        To ensure code quality, use project wide linter rules, keep the same aproach policy to solve
        similar problems, thorough PR reviews and testing.

# Humanizing Technologies: Challenge #2

## Project setup

### Initial installation

1.  Install pre-requisites:

        Node.js >=10
        @quasar/cli

2.  Install frontend packages (requires [`yarn`](https://classic.yarnpkg.com/en/docs/install)):

        yarn install

## Run the project

        quasar dev

## Username/password

        admin/admin

## Functionality

        1. To embed elements use drag&drop. In contrast to paper's {embeddingMode: true} option where
        intersection is determined with parent's box, the center coordinates of the child and
        findModelsFromPoint API is used, which gives more accurate result.

        2. To connect elements use Halo tools or ports (if any).

        3. To change positions inside one container - drag&drop with SHIFT key pressed.

        3. Graph is persisted to LocalStorage.
        
## TODOs
-    [x] test 1
-    [X] test 2
